---
title: Install guide
linkTitle: Install guide
weight: 7
date: 2020-09-18
description: Install Streams on-premise, or deploy in your private cloud, and learn how to upgrade an existing installation.
---

## Prerequisites

* Kubernetes 1.18
* Helm 3.0.2+
* PersistentVolumes and LoadBalancer provisioner supported by the underlying infrastructure

## Pre-installation

Download Steams helm chart corresponding to the `release-version` you want to install

```sh
cd <YOUR_INSTALL_DIR>/helm/streams
```

## Helm Chart installation

### Docker Registry settings

In order to store login credentials, we recommend using Kubernetes secrets.  
Docker images must be hosted on a docker registry accessible from your cluster.

In order to pull them from the Kubernetes cluster, you might need to create a secret with your Container registry credentials:

```sh
kubectl create secret docker-registry <registry-secret-name> --docker-server=<your-docker-registry>  --docker-username=< registry-username> --docker-password=< registry-password> -n my-namespace
```

### Kubernetes namespace

We recommend deploying Streams components inside a dedicated namespace. To create the namespace, run the following command:

```sh
kubectl create namespace my-namespace
```

### Configure passwords to secure connection to third-parties

Passwords are required for Streams microservices to securely connect to Hazelcast and Postgresql.
You must provide these passwords through Kubernetes [secrets](https://kubernetes.io/docs/concepts/configuration/secret/):

#### Create secret for Hazelcast

```sh
export HAZELCAST_PASSWORD="YourHazelcastPassword"
kubectl create secret generic streams-hazelcast-password-secret --from-literal=hazelcast-password=${HAZELCAST_PASSWORD} -n my-namespace
```

#### Create secret for PostgreSQL

```sh
export POSTGRES_ADMIN_PASSWORD="YourPostgresAdminPassword"
export POSTGRES_USER_PASSWORD="YourPostgresUserPassword"
export POSTGRES_REPLICATION_PASSWORD="YourPostgresReplicationPassword"
kubectl create secret generic streams-postgresql-password-secret --from-literal=postgresql-password=${POSTGRES_ADMIN_PASSWORD} --from-literal=postgresql-postgres-password=${POSTGRES_ADMIN_PASSWORD} --from-literal=postgresql-streams-password=${POSTGRES_USER_PASSWORD} --from-literal=postgresql-replication-password=${POSTGRES_REPLICATION_PASSWORD} -n my-namespace
```

### Database encryption

By default, Streams encrypts sensitive data using a password-based encryption mechanism.
All passwords must be at least `12` characters long and contain at least:

* One upper case character.
* One lower case character.
* One digit.
* One special character or punctuation without any space.

You must create a secret storing those passwords doing:

```bash
kubectl create secret generic streams-crypto-password-secret --from-literal=hub=<hub crypto password> --from-literal=subscriberWebhook=<webhook crypto password> --from-literal=subscriberKafka=<kafka crypto password> -n my-namespace
```

The three literals in the secret are used by their respective microservice to encrypt their data.

* `hub` is used by streams-hub.
* `subscriberWebhook` is used by streams-subscriber-webhook.
* `subscriberKafka` is used by streams-subscriber-kafka.

### Ingress TLS settings

SSL/TLS is *enabled by default* on our embedded Ingress controller. You need to provide an SSL/TLS certificate for the domain name you are using:

```sh
kubectl create secret tls streams-ingress-tls-secret --key=<path/to.key> --cert=<path/to-full-chain.crt> -n my-namespace
```

### PostgreSQL TLS settings

By default, Streams Helm will set up TLS communication between PostgreSQL and Streams microservices, so you must provide a certificate and its key. Below the required steps using a self-signed certificate:

* To create a self-signed certificate, use the following OpenSSL command: (only for testing purposes):

```sh
openssl req -x509 -newkey rsa:2048 -keyout server.key -out server.crt -text -nodes -subj '/CN=streams-postgresql'
```

Make sure to set the postgresql service name `streams-postgresql` as `Common Name`; All other should be left. blank using `.` as answer.

Then you must create a secret storing those files doing:

```sh
kubectl create secret generic postgresql-certificates-secret --from-file=./server.crt --from-file=./server.key -n my-namespace
```

### Helm command

The command below deploys Streams on the Kubernetes cluster in High availability mode. The passwords for postgreSQL database and Hazelcast must be defined in the installation command line. By doing so, they are stored securely inside the k8s cluster and not visible in plaintext in `values.yaml` file. There are optional parameters that can be specified to customize the installation.

```sh
helm install my-release -f values.yaml -f values-ha.yaml \
  --set imagePullSecrets[0].name=< registry-secret-name >  [--set <parameter>=<value>] \
  -n my-namespace
```

Note: The default configuration only accepts incoming HTTP requests to `k8s.yourdomain.tld`

#### Helm parameters

| Parameter                             | Description                         | Mandatory | Default value |
| ------------------------------------- | ----------------------------------- | --------- | ------------- |
| postgresql.tls.enabled                | PostgreSQL tls enabled              | no        | yes           |
| nginx-ingress.enabled                 | Enable/Disable NGINX                | no        | true          |
| ingress.host | Domain name used for incoming HTTP requests if nginx-ingress.enabled is set to true | no | k8s.yourdomain.tld |
| ingress.tlsenabled                    | Enable embedded ingress SSL/TLS     | no        | true          |
| ingress.tlsSecretName                 | Embedded ingress SSL/TLS certificate secret name | no | streams-ingress-tls-secret |
| subscriberSse.replicaCount            | Subscriber SSE replica count        | no        | 2             |
| subscriberSse.ports.containerPort     | Http port to subscribe to a topic   | no        | 8080          |
| hub.replicaCount                      | Hub replica count                   | no        | 2             |
| hub.ports.containerPort               | Http port to reach the Streams Topics API | no  | 8080          |
| hub.crypto.enabled                    | Database encryption enabled         | yes       | true          |
| subscriberWebhook.replicaCount        | Subscriber Webhook replica count    | no        | 2             |
| subscriberWebhook.ports.containerPort | Http port to subscribe to a topic   | no        | 8080          |
| subscriberWebhook.crypto.enabled      | Database encryption enabled         | yes       | true          |
| subscriberKafka.crypto.enabled        | Database encryption enabled         | yes       | true          |
| publisherHttpPoller.replicaCount      | Publisher HTTP Poller replica count | no        | 2             |
| publisherHttpPost.replicaCount        | Publisher HTTP Post replica count   | no        | 2             |
| publisherHttpPost.ports.containerPort | Http port to publish to a topic     | no        | 8080          |

## Upgrade

To upgrade your Streams installation with a new minor version or update your configuration:

* Optional: update the `values.yaml` files with any custom configuration
* Upgrade your Streams installation:

```sh
helm upgrade my-release . [-f values.yaml] [-f values-ha.yaml] [--set key=value[,key=value]] -n my-namespace
```

Be careful, any difference in the `values.yaml` file or in the `--set` parameter from the initial installation will be upgraded too.
So, if you initially installed Streams with `-f values.yaml` or `-f values-ha.yaml`, you have to specify the same parameters for the upgrade.

Note that, to avoid downtime during the upgrade, it is recommended to have at least `2` replicas of each pod before upgrading the Chart.

After an upgrade, a rollback is possible with the following command:

```sh
helm rollback my-release -n my-namespace
```

## Uninstallation

To uninstall Streams, run following command:

```sh
helm uninstall my-release –n my-namespace
```

The command removes all the Kubernetes components associated with the chart and deletes the release.

Note that PersistentVolumeClaims required by Kafka and PostgreSQL are NOT deleted when the release is deleted. If you wish to delete them you can do it with the following command:

```sh
kubectl -n my-namespace get persistentvolumeclaims --no-headers=true | awk '/ streams/{print $1}' | xargs kubectl delete -n my-namespace persistentvolumeclaims
```

## Backup & Disaster recovery

It is essential for the smooth operation of Streams to perform regular backups of data and configurations. There are two kinds of data that we encourage to backup:

* Configurations: Helm chart installation files - If you apply any modification to the default Streams helm chart, such as editing the values.yaml file, we recommend tracking the changes and back up the code in a source code repository. We recommend using git to address this point.
* Data: persistent volumes of Kubernetes services - We do not provide any procedure to backup/restore volume data as it will mainly depend on your iPaaS. Nevertheless, you can have a look at stash project that enables the backup/restore of stateful applications (PostgreSql, Kafka, Zookeeper) into AWS S3 buckets, for instance.

For a disaster recovery procedure, you should have access to cloud resources in another region. Using backed-up configurations/data and Streams helm chart, you should be able to run a new installation in a new Kubernetes cluster in another region.

Note: The information provided in this section are only guidelines to help you implement your own disaster recovery procedure which needs to take into consideration your own constraints and environments. When disaster strikes, you must be prepared with a runbook of specific actions to take that are proven to work, considering your specific environments.
