---
title: Backup and disaster recovery
linkTitle: Backup and disaster recovery
weight: 4
date: 2021-02-18
description: Learn how to back up Streams data and configurations that you can use to recover from a disaster.
---

We recommend you to back up your external MariaDB, Kafka cluster, and your Streams installation on Kubernetes on a regular basis to ensure that you can restore you data and configurations in case of loss.

## Back up MariaDB

The procedure to back up a database depends on your deployment infrastructure, and the back up of SLA/OLA and RPO/RTO depends on the chosen cloud provider. As we recommend to manage database outside kubernetes, following we describe how to manage it with Amazon Web Services (AWS).

### Back up AWS RDS

AWS Relational Database Service (RDS) instances have daily backups planned during the backup window. A default backup windows is set accordingly to your region. For more information, see [AWS documentation](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithAutomatedBackups.html#USER_WorkingWithAutomatedBackups.BackupWindow).

If automated backups are disable, you can enable them by setting the backup retention period to a positive value. For more information, see [AWS documentation](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithAutomatedBackups.html#USER_WorkingWithAutomatedBackups.Enabling).

You can also create a manual snapshot using the AWS CLI:

```sh
export RDS_ID="<my_rds_instance>"
export SNAPSHOT_ID="<my_snapshot>"
 
aws rds create-db-snapshot \
    --db-instance-identifier "${RDS_ID}" \
    --db-snapshot-identifier "${SNAPSHOT_ID}"
```

You can automated this command, for example, by creating a cron job, to increase the frequency of the backups.

{{< alert title="Note" >}}The RPO depends on the frequency of your backup. The default is 24H.{{< /alert >}}

### Restore AWS RDS

You can restore your RDS backup to a new RDS instance using the AWS CLI.

1. Run the following command to export your data:

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

    A new RDS instance should be available after ~2 minutes.

2. After the instance is available, run the following command to retrieve its endpoint:

    ```sh
    export RDS_NAME="<my_new_rds_name>"
     
    aws rds describe-db-instances \
        --db-instance-identifier "${RDS_NAME}" \
        --query 'DBInstances[0].Endpoint.Address' \
        --output text
    ```

3. Upgrade your Streams installation to use the new endpoint:

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

    After several seconds all Streams pods should be redeployed and running with the new configuration.

## Back up Kafka clusters

The procedures for the Kafka cluster are environment agnostic, however SLA/OLA and RPO/RTO will depend on your cloud provider. As we recommend to manage Kafka outside kubernetes, following we describe procedures that have been tested with MSK on AWS, but that could be used in any Kafka installation.

We have used [MirrorMaker 2](https://cwiki.apache.org/confluence/display/KAFKA/KIP-382%3A+MirrorMaker+2.0) to mirror the cluster data and the configuration to another Kafka cluster.

### Requirements

Before you start:

* Set up a new Kafka cluster with the same configuration as your production cluster. Setting up a cluster with lower resources for cost optimization is possible, but you must ensure your Kafka cluster backup can handle all the messages that will be mirrored from the production Kafka cluster.
* Set up a tooling instance using Kafka. You can use the same version as the [embedded Kafka in Streams installation](/docs/architecture/#kafka). This instance must be able to access the production Kafka bootstrap servers and the backup Kafka bootstrap servers.

It is highly recommended to monitor all the instances deployed in the context of this disaster and recovery plan procedure.

### Enable the Kafka cluster back up

To start the back up:

1. Create a MirrorMaker 2 configuration file. The following is a MirrorMaker 2 sample configuration file, where you only need to fill the parameters:
    * `source.bootstrap.servers`
    * `target.replication.factor`
    * and the authentication parameters:
        * `sasl`
        * `ssl`
        * `security`

    ```sh
    cat > mm2.config <<EOF
    # Licensed to the Apache Software Foundation (ASF) under A or more
    # contributor license agreements.  See the NOTICE file distributed with
    # this work for additional information regarding copyright ownership.
    # The ASF licenses this file to You under the Apache License, Version 2.0
    # (the "License"); you may not use this file except in compliance with
    # the License.  You may obtain a copy of the License at
    #
    #    http://www.apache.org/licenses/LICENSE-2.0
    #
    # Unless required by applicable law or agreed to in writing, software
    # distributed under the License is distributed on an "AS IS" BASIS,
    # WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    # See the License for the specific language governing permissions and
    # limitations under the License.
    # see org.apache.kafka.clients.consumer.ConsumerConfig for more details
    
    # Sample MirrorMaker 2.0 top-level configuration file
    # Run with ./bin/connect-mirror-maker.sh connect-mirror-maker.properties
    
    # specify any number of cluster aliases
    clusters = source, target
    # Leave the following parameters empty for a backup configuration
    source.cluster.alias =
    target.cluster.alias =
    
    # connection information for each cluster
    # This is a comma separated host:port pairs for each cluster
    # for e.g. "host1:9096, host2:9096, host3:9096"
    # source is your production cluster, target is your backup cluster
    source.bootstrap.servers = <your-prod-kafka-bootstrap-servers>
    target.bootstrap.servers = <your-backup-kafka-bootstrap-servers>
    
    # enable and configure individual replication flows
    source->target.enabled = true
    
    # regex which defines which topics gets replicated. For eg "foo-.*"
    source->target.topics = streams.*
    
    target->source.enabled = false
    #target->source.topics = .*
    
    # Setting replication factor of newly created remote topics
    source.replication.factor = 1
    target.replication.factor = 1
    
    # Setup your authentication parameters here
    security.protocol=SASL_SSL
    sasl.mechanism=SCRAM-SHA-512
    sasl.jaas.config=org.apache.kafka.common.security.scram.ScramLoginModule required username="<username>" password="<password>";
    ssl.truststore.password=<keystore-password>
    ssl.truststore.location=<path-to-your-keystore>
    
    ############################# Internal Topic Settings  #############################
    # The replication factor for mm2 internal topics "heartbeats", "B.checkpoints.internal" and
    # "mm2-offset-syncs.B.internal"
    # For anything other than development testing, a value greater than 1 is recommended to ensure availability such as 3.
    checkpoints.topic.replication.factor=3
    heartbeats.topic.replication.factor=3
    offset-syncs.topic.replication.factor=3
    
    # The replication factor for connect internal topics "mm2-configs.B.internal", "mm2-offsets.B.internal" and
    # "mm2-status.B.internal"
    # For anything other than development testing, a value greater than 1 is recommended to ensure availability such as 3.
    offset.storage.replication.factor=3
    status.storage.replication.factor=3
    config.storage.replication.factor=3
    
    # customize as needed
    # replication.policy.separator = _
    replication.policy.separator =
    # sync.topic.acls.enabled = false
    # emit.heartbeats.interval.seconds = 5
    EOF
    ```

2. When your production environnement is up and running, you must start MirrorMaker 2 from the tooling instance:

    ```sh
    connect-mirror-maker.sh mm2.config
    ```

3. Ensure that there is no error in the log flow. After several seconds, the mirroring is started and working. A running process with no logs means that it works. To verify that Kafka is properly mirrored, you can list the topics on the Kafka backup. To do so, create a configuration file using this sample configuration file, where you only need to fill in your authentication parameters:

    ```sh
    cat > backup-kafka.config <<EOF
    security.protocol=SASL_SSL
    sasl.mechanism=SCRAM-SHA-512
    sasl.jaas.config=org.apache.kafka.common.security.scram.ScramLoginModule required username="<username>" password="<password>";
    ssl.truststore.password=<keystore-password>
    ssl.truststore.location=<path-to-your-keystore>
    EOF
    ```

4. Run the following command to list the existing topics:

    ```sh
    export BOOTSTRAP_SERVERS="<your-backup-Kafka-bootstrap-server-here>"
    
    kafka-topics.sh --list --bootstrap-server "${BOOTSTRAP_SERVERS}" --command-config ./backup-kafka.config
    ```

## Restore Kafka clusters

To restore the data from you backup cluster:

1. Create a fresh production Kafka cluster with the same configuration as your initial production Kafka cluster that has failed.
2. Configure MirrorMaker 2 to mirror the data from your backup cluster to the new production cluster.

When this is done, you can reconfigure your Streams installation so that the microservices connect to the new production Kafka cluster.

To sum up, the procedure is as following:

* Create a new Kafka production cluster.
* Stop MirrorMaker 2 which, was configured during the back up procedure.
* Start MirrorMaker 2 with backup cluster configured as source and new production cluster configured as target.
* When the mirroring is finished, stop MirrorMaker 2.
* Reconfigure your Streams installation so that the microservices connect to the new production cluster. For instance:
    ```
    helm -n ${NAMESPACE} get values ${HELM_RELEASE} > /tmp/values.yaml && helm -n ${NAMESPACE} upgrade ${HELM_RELEASE} . -f /tmp/values.yaml --set externalizedKafka.bootstrapServers="<new-production-kafka-bootstrap-server>"
    ```
* At this point, your Streams installation should be back up and running. After you have validated the new setup, proceed to next step.
* Start MirrorMaker 2 with new production cluster configured as source and backup cluster configured as target so that you get back to the normal backup procedure state.

## Manage backups of Streams Kubernetes installation

To manage backups of Streams Kubernetes installation, we recommend you to use [Velero](https://velero.io/), which can be easily installed and configured with several cloud providers.

### Install AWS Velero

The following sections describe how to install AWS Velero.

#### Configure AWS S3 bucket

Configure an AWS bucket to start the Velero installation.

1. Create an AWS S3 bucket to use as storage for Velero backups:
    ```sh
    export REGION="<my-aws-region>"
    export VELERO_BUCKET="<my-bucket-name>"
     
    aws s3api create-bucket \
        --bucket "${VELERO_BUCKET}" \
        --region "${REGION}" \
        --create-bucket-configuration LocationConstraint="${REGION}"
    ```
2. Create the Velero AWS user:

    ```sh
    export VELERO_USERNAME="<my-velero-username>"
     
    aws iam create-user --user-name "${VELERO_USERNAME}"
    ```
3. Create the AWS policy for the Velero user:
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
4. Apply the policy:
    ```sh
    export VELERO_USERNAME="<my-velero-username>"
     
    aws iam put-user-policy \
        --user-name "${VELERO_USERNAME}" \
        --policy-name "${VELERO_USERNAME}" \
        --policy-document file://velero-policy.json
    ```
5. Create an access key for the Velero user:
    ```sh
    export VELERO_USERNAME="<my-velero-username>"
    export VELERO_BUCKET="<my-bucket-name>"
     
    aws iam create-access-key --user-name "${VELERO_USERNAME}" > velero-access-key.json
     ```
6. Retrieve access key for Velero installation:
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

### Create a backup using Velero

To create a backup manually, you must connect to the Velero pod and run the backup creation command:

```sh
export VELERO_NAMESPACE="<my-velero-namespace>"
export VELERO_POD="$(kubectl get pod -n "${VELERO_NAMESPACE}" --no-headers -o=custom-columns=NAME:.metadata.name)"
export BACKUP_NAME="<my-backup>"
 
kubectl -n "${VELERO_NAMESPACE}" exec -it "${VELERO_POD}" -- /velero backup create "${BACKUP_NAME}" --include-namespaces "${STREAMS_NAMESPACE}"
```

### Schedule a backup using Velero

You can also schedule backups. The schedule template is in cron notation, using UTC time. The schedule can also be expressed using `@every <duration>` syntax. You can specify the duration using a combination of seconds(s), minutes(m), and hours(h). For example: `@every 2h30m`.

You can use the following example to schedule a backup using Velero:

```sh
export VELERO_NAMESPACE="<my-velero-namespace>"
export VELERO_POD="$(kubectl get pod -n "${VELERO_NAMESPACE}" --no-headers -o=custom-columns=NAME:.metadata.name)"
export SCHEDULE_BACKUP_NAME="<my-backup>"
export SCHEDULE_CRON="<my-scheduling>"
 
kubectl -n "${VELERO_NAMESPACE}" exec -it "${VELERO_POD}" -- /velero schedule create "${SCHEDULE_BACKUP_NAME}" --schedule="${SCHEDULE_CRON}" --include-namespaces "${STREAMS_NAMESPACE}"
```

{{< alert title="Note" >}}The RPO depends on the frequency of your backup.{{< /alert >}}

### Restore a Velero backup

To restore a Velero backup, ensure that the previous Streams installation are totally removed. Then, run the following command to restore the backup:

```sh
export VELERO_NAMESPACE="<my-velero-namespace>"
export VELERO_POD="$(kubectl get pod -n "${VELERO_NAMESPACE}" --no-headers -o=custom-columns=NAME:.metadata.name)"
export BACKUP_NAME="<my-backup>"
 
# From a manual backup
kubectl -n "${VELERO_NAMESPACE}" exec -it "${VELERO_POD}" -- /velero restore create --from-backup "${BACKUP_NAME}"
 
# From a schedule backup
kubectl -n "${VELERO_NAMESPACE}" exec -it "${VELERO_POD}" -- /velero restore create --from-schedule "${BACKUP_NAME}"
```

After a few seconds, all pods in you previous Streams namespace should be starting.

#### Restore a Velero backup on a new K8s cluster

To restore a Velero backup on a new K8s cluster:

1. Follow [Install AWS Velero](#install-aws-velero) to reinstall Velero on the new cluster.
2. Use the same AWS S3 bucket created during the Velero installation.
3. Restore the backups using the commands from [Restore a Velero backup](#restore-a-velero-backup) section.

#### Known limitations

* You must restore the backup in the same namespace as its creation, otherwise some configurations might broke.
* Velero does not overwrite objects in-cluster if they already exist.