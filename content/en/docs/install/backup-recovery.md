---
title: Backup and disaster recovery
linkTitle: Backup and disaster recovery
weight: 4
date: 2021-02-18
description: Learn how to perform regular backups of data and configurations and that can be used to recover from a disaster.
---

It is essential for the smooth operation of Streams to perform regular backups of data and configurations. Following our [recommendations](docs/install), you should backup your external [MariaDB](#mariadb), your external [Kafka](#kafka) cluster and your [Streams installation](#streams-kubernetes-installation) on Kubernetes.

## MariaDB

As the database is managed outside Kubernetes, the all backup/restore procedures will depend on the Cloud Provider used.
Therefore, SLA/OLA and RPO/RTO will depend on the Cloud Provider and the configuration of your backups.

### RDS AWS backup procedure

By default, RDS instance have a daily backup planned during the backup window (if you don't specify it, a default window will be set according to your region (see [AWS documentation](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithAutomatedBackups.html#USER_WorkingWithAutomatedBackups.BackupWindow)).
If automated backups are disable, you can enable them by setting the backup retention period to a positive value (see [AWS documentation](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithAutomatedBackups.html#USER_WorkingWithAutomatedBackups.Enabling)).

You can also create a manual snapshot using the AWS CLI:

```sh
export RDS_ID="<my_rds_instance>"
export SNAPSHOT_ID="<my_snapshot>"
 
aws rds create-db-snapshot \
    --db-instance-identifier "${RDS_ID}" \
    --db-snapshot-identifier "${SNAPSHOT_ID}"
```

With this, you can easily automated this command to increase the frequency of the backups.

{{< alert title="Note" >}}
The RPO will depends on the frequency of your backup (by default it will be 24H).
{{< /alert >}}

### RDS AWS restore procedure

You can restore a RDS backup to a new RDS instance using the AWS CLI:

```sh
export RDS_NAME="<my_new_rds_name>"
export SNAPSHOT_ID="<my_snapshot>"
export SUBNET_GROUP_ID="<my_subnet_groub>"
export SECURITY_GROUP_IDS="<my_security_groups>"
 
aws rds restore-db-instance-from-db-snapshot \
    --db-instance-identifier "${RDS_NAME}" \
    --db-snapshot-identifier "${SNAPSHOT_ID}" \
    --db-subnet-group-name "${SUBNET_GROUP_ID}" \
    --vpc-security-group-ids "${SECURITY_GROUP_IDS}"
```

A new RDS instance should be available after several minutes (~ 2 minutes). Then, its endpoint can be retrieve using this command:

```sh
export RDS_NAME="<my_new_rds_name>"
 
aws rds describe-db-instances \
    --db-instance-identifier "${RDS_NAME}" \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text
```

Next, you must upgrade your Streams installation to use this new endpoint:

```sh
export RDS_ENDPOINT="<my_rds_endpoint>"
export NAMESPACE="<my-namespace>"
export HELM_RELEASE_NAME="<my-release>"
 
helm upgrade "${HELM_RELEASE_NAME}" . \
    [-f values.yaml] \
    [-f values-ha.yaml] \
    [--set key=value[,key=value]] \
    -n "${NAMESPACE}" \
    --set externalizedMariadb.host="${RDS_ENDPOINT}"
```

All Streams pods must be redeployed and running with the new configuration after several seconds.

## Kafka

TODO

## Streams kubernetes installation

To manage backups of Streams Kubernetes installation, we recommend to use [Velero](https://velero.io/) that can be easily installed and configured with several Cloud Provider.

### AWS Velero installation

#### Configure AWS S3 bucket

Create an AWS S3 bucket that will be used as Storage for Velero backups:

```sh
export REGION="<my-aws-region>"
export VELERO_BUCKET="<my-bucket-name>"
 
aws s3api create-bucket \
    --bucket "${VELERO_BUCKET}" \
    --region "${REGION}" \
    --create-bucket-configuration LocationConstraint="${REGION}"
```

Create the Velero AWS user:

```sh
export VELERO_USERNAME="<my-velero-username>"
 
aws iam create-user --user-name "${VELERO_USERNAME}"
```

Create the AWS policy for the Velero user:

```sh
export VELERO_BUCKET="<my-bucket-name>"
 
cat > velero-policy.json <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ec2:DescribeVolumes",
                "ec2:DescribeSnapshots",
                "ec2:CreateTags",
                "ec2:CreateVolume",
                "ec2:CreateSnapshot",
                "ec2:DeleteSnapshot"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:PutObject",
                "s3:AbortMultipartUpload",
                "s3:ListMultipartUploadParts"
            ],
            "Resource": [
                "arn:aws:s3:::${VELERO_BUCKET}/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::${VELERO_BUCKET}"
            ]
        }
    ]
}
EOF
```

Apply the policy:

```sh
export VELERO_USERNAME="<my-velero-username>"
 
aws iam put-user-policy \
    --user-name "${VELERO_USERNAME}" \
    --policy-name "${VELERO_USERNAME}" \
    --policy-document file://velero-policy.json
```

Create an access key for the Velero user:

```sh
export VELERO_USERNAME="<my-velero-username>"
export VELERO_BUCKET="<my-bucket-name>"
 
aws iam create-access-key --user-name "${VELERO_USERNAME}" > velero-access-key.json
 ```

Retrieve access key for Velero installation:

```sh
export VELERO_ACCESS_KEY_ID=$(cat velero-access-key.json | jq -r '.AccessKey.AccessKeyId')
export VELERO_SECRET_ACCESS_KEY=$(cat velero-access-key.json | jq -r '.AccessKey.SecretAccessKey')
 
cat > velero-credentials <<EOF
[default]
aws_access_key_id=$VELERO_ACCESS_KEY_ID
aws_secret_access_key=$VELERO_SECRET_ACCESS_KEY
EOF
```

#### Install Velero in kubernetes

Install Velero using the Helm chart:

```sh
export REGION="<my-aws-region>"
export VELERO_BUCKET="<my-bucket-name>"
export VELERO_NAMESPACE="<my-velero-namespace>"
export STREAMS_NAMESPACE="<my-streams-namespace>"
 
helm repo add vmware-tanzu https://vmware-tanzu.github.io/helm-charts && \
helm install velero vmware-tanzu/velero \
    --version 2.21.1 \
    --namespace "${VELERO_NAMESPACE}" \
    --create-namespace \
    --set-file credentials.secretContents.cloud=velero-credentials \
    --set configuration.provider=aws \
    --set configuration.backupStorageLocation.bucket="${VELERO_BUCKET}" \
    --set configuration.backupStorageLocation.config.region="${REGION}" \
    --set configuration.volumeSnapshotLocation.config.region="${REGION}" \
    --set initContainers[0].name=velero-plugin-for-aws \
    --set initContainers[0].image=velero/velero-plugin-for-aws:v1.2.0 \
    --set initContainers[0].volumeMounts[0].mountPath=/target \
    --set initContainers[0].volumeMounts[0].name=plugins
```

### Velero backup procedure

To create a backup manually, you have to connect to the Velero pod and launch the backup creation command:

```sh
export VELERO_NAMESPACE="<my-velero-namespace>"
export VELERO_POD="$(kubectl get pod -n "${VELERO_NAMESPACE}" --no-headers -o=custom-columns=NAME:.metadata.name)"
export BACKUP_NAME="<my-backup>"
 
kubectl -n "${VELERO_NAMESPACE}" exec -it "${VELERO_POD}" -- /velero create backups "${BACKUP_NAME}" --include-namespaces "${STREAMS_NAMESPACE}"
```

You can also schedule backups by the following command:

```sh
export VELERO_NAMESPACE="<my-velero-namespace>"
export VELERO_POD="$(kubectl get pod -n "${VELERO_NAMESPACE}" --no-headers -o=custom-columns=NAME:.metadata.name)"
export SCHEDULE_BACKUP_NAME="<my-backup>"
export SCHEDULE_CRON="<my-scheduling>"
 
kubectl -n "${VELERO_NAMESPACE}" exec -it "${VELERO_POD}" -- /velero schedule create "${SCHEDULE_BACKUP_NAME}" --schedule="${SCHEDULE_CRON}" --include-namespaces "${STREAMS_NAMESPACE}"
```

{{< alert title="Note" >}}
The schedule template in cron notation, using UTC time. The schedule can also be expressed using @every \<duration\> syntax. The duration can be specified using a combination of seconds (s), minutes (m), and hours (h), for example: @every 2h30m.
{{< /alert >}}

{{< alert title="Note" >}}
The RPO will depends on the frequency of your backup.
{{< /alert >}}

### Velero restore procedure

To restore a Velero backup, be sure the previous Streams installation are totally removed. Then  you can use this command:

```sh
export VELERO_NAMESPACE="<my-velero-namespace>"
export VELERO_POD="$(kubectl get pod -n "${VELERO_NAMESPACE}" --no-headers -o=custom-columns=NAME:.metadata.name)"
export BACKUP_NAME="<my-backup>"
 
# From a manual backup
kubectl -n "${VELERO_NAMESPACE}" exec -it "${VELERO_POD}" -- /velero restore create --from-backup "${BACKUP_NAME}"
 
# From a schedule backup
kubectl -n "${VELERO_NAMESPACE}" exec -it "${VELERO_POD}" -- /velero restore create --from-schedule "${BACKUP_NAME}"
```

All pods in you previous Streams namespace will be starting after a few seconds.

{{< alert title="Note" >}}
To restore a Velero backup on a new k8s cluster, you have to reinstall Velero on the new cluster following the installation guide and used the same AWS S3 bucket created during the first Velero installation.

Then, you can restore the backups with the command above.
{{< /alert >}}

{{< alert title="Warning" color="warning" >}}
Known limitations:

* You must restore the backup in the same namespace as its creation (some configurations would be broken).
* Velero doesn’t overwrite objects in-cluster if they already exist.
{{< /alert >}}