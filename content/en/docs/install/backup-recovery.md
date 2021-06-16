---
title: Backup and disaster recovery
linkTitle: Backup and disaster recovery
weight: 4
date: 2021-02-18
description: Learn how to perform regular backups of data and configurations and that can be used to recover from a disaster.
---

It is essential for the smooth operation of Streams to perform regular backups of data and configurations. Following our [recommendations](docs/install), you should backup your external [MariaDB](#mariadb), your external [Kafka](#kafka) cluster and your [Streams installation](#streams-kubernetes-installation) on Kubernetes.

## MariaDB

The procedures for the database will depend on your deployment infrastructure, moreover SLA/OLA and RPO/RTO will depend on the Cloud Provider chosen. As we recommend to manage database outside kubernetes, we will describe how to manage it with AWS.

### RDS AWS backup procedure

RDS instanced have backups planned daily during the backup window. A default backup windows is set according to your region (see [AWS documentation](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithAutomatedBackups.html#USER_WorkingWithAutomatedBackups.BackupWindow)).
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

The procedures for the Kafka cluster is environment agnostic, however SLA/OLA and RPO/RTO will depend on your Cloud Provider. As we recommend to manage Kafka outside kubernetes, the following procedures has been tested with MSK on AWS but could be used on any Kafka installation

It uses [MirrorMaker 2](https://cwiki.apache.org/confluence/display/KAFKA/KIP-382%3A+MirrorMaker+2.0) to mirror the cluster data and the configuration to another Kafka cluster.

### Backup procedure

#### Requirements

* Setup a new Kafka cluster with the same configuration as your production cluster. Setting up a cluster with lower resources for cost optimization is possible but you need to ensure your backup Kafka cluster is able to deal with all the messages that will be mirrored from the production Kafka cluster.

* Setup a tooling instance using Kafka (same version as for [embedded Kafka in Streams installation](/docs/architecture/#kafka)). This instance must be able to access the production Kafka bootstrap servers and the backup Kafka bootstrap servers.

This is highly recommended to monitor all the instances deployed in the context of this Disaster Recovery Plan.

#### Enable Backup

First, you have to create a MirrorMaker 2 configuration file. Here is a MirrorMaker 2 sample configuration file where you only need to fill in the source and target bootstrap servers, and your authentication parameters:

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

#Setup your authentication parameters here
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

When your production environnement is up and running, you need to start MirrorMaker 2 from the tooling instance:

```sh
connect-mirror-maker.sh mm2.config
```

Make sure there is no error in the log flow. After several seconds, the mirroring is started and working (a running process with no logs means that it works).

You can double check that Kafka is properly mirrored by listing the topics on the backup Kafka. To do so, create a configuration file using this sample configuration file where you only need to fill in your authentication parameters:

```sh
cat > backup-kafka.config <<EOF
security.protocol=SASL_SSL
sasl.mechanism=SCRAM-SHA-512
sasl.jaas.config=org.apache.kafka.common.security.scram.ScramLoginModule required username="<username>" password="<password>";
ssl.truststore.password=<keystore-password>
ssl.truststore.location=<path-to-your-keystore>
EOF
```

Then the following command will list the existing topics:

```sh
export BOOTSTRAP_SERVERS="<your-backup-Kafka-bootstrap-server-here>"

kafka-topics.sh --list --bootstrap-server "${BOOTSTRAP_SERVERS}" --command-config ./backup-kafka.config
```

### Restore procedure

In order to restore the data from you backup cluster, you first need to create a fresh production Kafka cluster with the same configuration as your initial production Kafka cluster that has failed.
Then, you will have to configure MirrorMaker 2 to mirror the data from your backup cluster to the new production cluster. When it's done, you can reconfigure your Streams installation so that the microservices connect to the new production Kafka cluster. To sum up, the steps are the following:

* Create a new Kafka production cluster
* Stop MirrorMaker 2 which was configured in backup procedure
* Start MirrorMaker 2 with backup cluster configured as source and new production cluster configured as target
* When the mirroring is done, stop MirrorMaker 2
* Reconfigure your Streams installation so that the microservices connect to the new production cluster, for instance: `helm -n ${NAMESPACE} get values ${HELM_RELEASE} > /tmp/values.yaml && helm -n ${NAMESPACE} upgrade ${HELM_RELEASE} . -f /tmp/values.yaml --set externalizedKafka.bootstrapServers="<new-production-kafka-bootstrap-server>"`
* At this step, your Streams installation should be back up and running. Once you have validated the new setup, you can proceed to next step
* Start MirrorMaker 2 with new production cluster configured as source and backup cluster configured as target so that you get back to the normal backup procedure state

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
 
kubectl -n "${VELERO_NAMESPACE}" exec -it "${VELERO_POD}" -- /velero backup create "${BACKUP_NAME}" --include-namespaces "${STREAMS_NAMESPACE}"
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