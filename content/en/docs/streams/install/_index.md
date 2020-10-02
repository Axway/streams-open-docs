---
title: Install Streams
linkTitle: Install Streams
weight: 7
date: 2020-09-18
description: Install Streams on-premise, or deploy in your private cloud, and learn how to upgrade an existing installation.
---

## Prerequisites

* Kubernetes 1.18+
* Helm 3.0.2+
* RBAC enabled
* PersistentVolumes and LoadBalancer provisioner supported by the underlying infrastructure
* Resources: for the minimal configuration the cluster must have at least `9` CPUs and `10` GB RAM dedicated to the platform.

{{< alert title="Note" >}}
Refer to the [Reference Architecture](/docs/streams/architecture) documentation for further details.
{{< /alert >}}

## Pre-installation

Download Steams helm chart corresponding to the `release-version` you want to install.

```sh
export INSTALL_DIR="MyInstallDirectory"

cd ${INSTALL_DIR}/helm/streams
```

## Helm Chart installation

### Kubernetes namespace

We recommend to deploy Streams components inside a dedicated namespace. To create a namespace, run the following command:

```sh
export NAMESPACE="my-namespace"

kubectl create namespace "${NAMESPACE}"
```

### Docker Registry settings

Docker images must be hosted on a docker registry accessible from your Kubernetes cluster.
In order to securely store registry login credentials, we recommend using Kubernetes [secrets](https://kubernetes.io/docs/concepts/configuration/secret/):  

```sh
export NAMESPACE="my-namespace"
export REGISTRY_SECRET_NAME="my-registry-secret-name"
export REGISTRY_SERVER="my-registry-server"
export REGISTRY_USERNAME="my-registry-username"
export REGISTRY_PASSWORD="my-registry-password"

kubectl create secret docker-registry "${REGISTRY_SECRET_NAME}" --docker-server="${REGISTRY_SERVER}"  --docker-username="${REGISTRY_USERNAME}" --docker-password="${REGISTRY_PASSWORD}" -n "${NAMESPACE}"
```

To use Axway [DockerHub](https://hub.docker.com/) as your container registry:

* Set `REGISTRY_SERVER` to `https://index.docker.io/v1/`.
* Set `REGISTRY_USERNAME` with your DockerHub account username.
* set `REGISTRY_PASSWORD` with your DockerHub account password or an [access token](https://hub.docker.com/settings/security) for more security.

Finally, to use the secret you just created, you can either:

* Edit the `values.yaml` file and set the `imagePullSecrets` entry as follow:

```yaml
imagePullSecrets:
  - name: my-registry-secret-name
```

* or specify `--set imagePullSecrets[0].name="${REGISTRY_SECRET_NAME}"` in the Helm Chart installation command.

### Configure passwords to secure connection to third-parties

Passwords are required for Streams microservices to securely connect to Hazelcast and Postgresql.
You must provide these passwords through Kubernetes [secrets](https://kubernetes.io/docs/concepts/configuration/secret/):

* Create secret for Hazelcast:

```sh
export NAMESPACE="my-namespace"
export HAZELCAST_PASSWORD="my-hazelcast-password"

kubectl create secret generic streams-hazelcast-password-secret --from-literal=hazelcast-password="${HAZELCAST_PASSWORD}" -n "${NAMESPACE}"
```

* Create secret for PostgreSQL:

```sh
export NAMESPACE="my-namespace"
export POSTGRES_ADMIN_PASSWORD="my-postgres-admin-password"
export POSTGRES_USER_PASSWORD="my-postgres-user-password"
export POSTGRES_REPLICATION_PASSWORD="my-postgres-replication-password"

kubectl create secret generic streams-postgresql-password-secret --from-literal=postgresql-password="${POSTGRES_ADMIN_PASSWORD}" --from-literal=postgresql-postgres-password="${POSTGRES_ADMIN_PASSWORD}" --from-literal=postgresql-streams-password="${POSTGRES_USER_PASSWORD}" --from-literal=postgresql-replication-password="${POSTGRES_REPLICATION_PASSWORD}" -n "${NAMESPACE}"
```

### Database encryption

By default, Streams encrypts sensitive data using a password-based encryption mechanism.
All passwords must be at least `12` characters long and contain at least:

* One upper case character.
* One lower case character.
* One digit.
* One special character or punctuation without any space.

You must create a secret storing those passwords doing:

```sh
export NAMESPACE="my-namespace"
export CRYPTO_HUB_PASSWORD="my-crypto-hub-password"
export CRYPTO_WEBHOOK_PASSWORD="my-crypto-webhook-password"
export CRYPTO_KAFKA_PASSWORD="my-crypto-kafka-password"

kubectl create secret generic streams-crypto-password-secret --from-literal=hub="${CRYPTO_HUB_PASSWORD}" --from-literal=subscriberWebhook="${CRYPTO_WEBHOOK_PASSWORD}" --from-literal=subscriberKafka="${CRYPTO_KAFKA_PASSWORD}" -n "${NAMESPACE}"
```

The three literals in the secret are used by their respective microservice to encrypt their data.

* `hub` is used by streams-hub.
* `subscriberWebhook` is used by streams-subscriber-webhook.
* `subscriberKafka` is used by streams-subscriber-kafka.

To disable database encryption (not recommended), see [Helm parameters](#helm-parameters).

### Ingress TLS settings

SSL/TLS is enabled by default on our embedded Ingress controller. You need to provide an SSL/TLS certificate for the domain name you are using (CN field should match the `ingress.host` [Helm parameter](#helm-parameters)):

```sh
export NAMESPACE="my-namespace"
export INGRESS_TLS_KEY_PATH="my-key-path"
export INGRESS_TLS_CHAIN_PATH="my-chain-path"

kubectl create secret tls streams-ingress-tls-secret --key==${INGRESS_TLS_KEY_PATH} --cert="${INGRESS_TLS_CHAIN_PATH}" -n "${NAMESPACE}"
```

To disable SSL/TLS (not recommended for production use), see [Helm parameters](#helm-parameters).

### PostgreSQL TLS settings

By default, Streams Helm chart will set up TLS communication between PostgreSQL and Streams microservices, so you must provide a certificate and its key. Below are the steps required using a self-signed certificate:

* Create a self-signed certificate using the following OpenSSL command: (only for testing purposes):

```sh
openssl req -x509 -newkey rsa:2048 -keyout server.key -out server.crt -text -nodes -subj '/CN=streams-postgresql'
```

{{< alert title="Note" >}}Make sure to set the postgresql service name `streams-postgresql` as `Common Name`; All other should be left blank using `.` as answer.{{< /alert >}}

* Create a secret to store both certificate and key files:

```sh
export NAMESPACE="my-namespace"

kubectl create secret generic postgresql-certificates-secret --from-file=./server.crt --from-file=./server.key -n "${NAMESPACE}"
```

To disable database TLS (not recommended for production use), see [Helm parameters](#helm-parameters).

### Helm install command

#### Non HA configuration

The command below deploys Streams components in a non-HA configuration with 1 replica per microservices (not recommended for production use).

```sh
export NAMESPACE="my-namespace"
export HELM_RELEASE_NAME="my-release"

helm install "${HELM_RELEASE_NAME}" . \
  [--set <parameter>=<value>] \
  -f values.yaml \
  -n "${NAMESPACE}"
```

#### HA configuration

The command below deploys Streams on the Kubernetes cluster in High availability (recommend for production).
Note that optional [Helm parameters](#helm-parameters) can be specified to customize the installation.

```sh
export NAMESPACE="my-namespace"
export HELM_RELEASE_NAME="my-release"

helm install "${HELM_RELEASE_NAME}" . \
  [--set <parameter>=<value>] \
  -f values.yaml \
  -f values-ha.yaml \
  -n "${NAMESPACE}"
```

{{< alert title="Note" >}}
The default configuration only accepts incoming HTTP/HTTPS requests to `k8s.yourdomain.tld`.
Refer to the [Helm parameters](#helm-parameters) for further details.
{{< /alert >}}

### Validate the installation

If Streams is successfully installed, the output of the `helm install` command should be (for non-HA configuration):

```sh
NAME: my-release
LAST DEPLOYED: Wed Mar 25 15:18:45 2020
NAMESPACE: default
STATUS: deployed
REVISION: 1
NOTE: ...
```

After a few minutes, all the pods should be running properly:

```sh
export NAMESPACE="my-namespace"
kubectl get po -n "${NAMESPACE}"

NAME                                                           READY   STATUS    RESTARTS   AGE
streams-hazelcast-0                                            1/1     Running   0          116s
streams-kafka-0                                                1/1     Running   0          116s
streams-postgresql-0                                           1/1     Running   0          116s
streams-zookeeper-0                                            1/1     Running   0          116s
my-release-hub-675c6f9f6-8gplz                                 1/1     Running   0          116s
my-release-ingress-nginx-controller-58bfd85658-6plf5           1/1     Running   0          116s
my-release-publisher-http-poller-6cc5cd9fc6-q564p              1/1     Running   0          116s
my-release-publisher-http-post-5b745f864-dpws8                 1/1     Running   0          116s
my-release-subscriber-sse-7fd8c56f48-wvgtq                     1/1     Running   0          116s
my-release-subscriber-webhook-84469bd68f-lqxgk                 1/1     Running   0          116s
[...]
```

In order to check that Streams is running:

1. Create a topic with default settings using the provided Postman collection and Postman environment.
2. Try to subscribe with SSE to your topic:

```sh
curl "http://k8s.yourdomain.tld/subscribers/sse/topics/{TOPIC_ID}"
```

{{< alert title="Note" >}}
The default configuration only accepts incoming HTTP/HTTPS requests to `k8s.yourdomain.tld`.
Refer to the [Helm parameters](#helm-parameters) for further details.
{{< /alert >}}

#### Helm parameters

| Parameter                             | Description                         | Mandatory | Default value |
| ------------------------------------- | ----------------------------------- | --------- | ------------- |
| ingress-nginx.enabled                 | Enable/Disable NGINX                | no        | true          |
| ingress.host | Domain name used for incoming HTTP requests if `ingress-nginx.enabled` is set to true | no | k8s.yourdomain.tld |
| ingress.tlsenabled                    | Enable embedded ingress SSL/TLS     | no        | true          |
| ingress.tlsSecretName                 | Embedded ingress SSL/TLS certificate secret name | no | streams-ingress-tls-secret |
| postgresql.tls.enabled                | PostgreSQL tls enabled              | no        | yes           |
| hub.replicaCount                      | Hub replica count                   | no        | 2             |
| hub.ports.containerPort               | Http port to reach the Streams Topics API | no  | 8080          |
| hub.crypto.enabled                    | Database encryption enabled         | yes       | true          |
| subscriberSse.enabled                 | Enable/Disable Subscriber SSE       | no        | true          |
| subscriberSse.replicaCount            | Subscriber SSE replica count        | no        | 2             |
| subscriberSse.ports.containerPort     | Http port to subscribe to a topic   | no        | 8080          |
| subscriberWebhook.enabled             | Enable/Disable Subscriber Webhook   | no        | true          |
| subscriberWebhook.replicaCount        | Subscriber Webhook replica count    | no        | 2             |
| subscriberWebhook.ports.containerPort | Http port to subscribe to a topic   | no        | 8080          |
| subscriberWebhook.crypto.enabled      | Database encryption enabled         | yes       | true          |
| subscriberKafka.enabled               | Enable/Disable Subscriber Kafka     | no        | true          |
| subscriberKafka.replicaCount          | Subscriber Kafka replica count      | no        | 2             |
| subscriberKafka.ports.containerPort   | Http port to subscribe to a topic   | no        | 8080          |
| subscriberKafka.crypto.enabled        | Database encryption enabled         | yes       | true          |
| publisherHttpPoller.enabled           | Enable/Disable Publisher HTTP Poller | no       | true          |
| publisherHttpPoller.replicaCount      | Publisher HTTP Poller replica count | no        | 2             |
| publisherHttpPost.enabled             | Enable/Disable Publisher HTTP Post  | no        | true          |
| publisherHttpPost.replicaCount        | Publisher HTTP Post replica count   | no        | 2             |
| publisherHttpPost.ports.containerPort | Http port to publish to a topic     | no        | 8080          |
| publisherKafka.enabled                | Enable/Disable Publisher Kafka      | no        | true          |
| publisherKafka.replicaCount           | Publisher Kafka replica count       | no        | 2             |
| publisherSfdc.enabled                 | Enable/Disable Publisher SFDC       | no        | false         |
| publisherSfdc.replicaCount            | Publisher SFDC replica count        | no        | 2             |
| hazelcast.metrics.enabled             | Activate metrics endpoint for Hazelcast | no    | false         |
| postgresql.metrics.enabled            | Activate metrics endpoint for PostgreSQL | no   | false         |
| kafka.metrics.jmx.enabled             | Activate metrics endpoint for Kafka | no        | false         |
| kafka.zookeeper.metrics.enabled       | Activate metrics endpoint for Zookeeper | no    | false         |
| ingress-nginx.controller.metrics.enabled | Activate metrics endpoint for Ingress controller | no | false |
| actuator.prometheus.enabled           | Activate metrics endpoints for Streams services | no | false    |

{{< alert title="Note" >}}
If you want to configure a parameter from a dependency chart, [PostgreSQL](https://github.com/bitnami/charts/tree/master/bitnami/postgresql), [Kafka](https://github.com/bitnami/charts/tree/master/bitnami/kafka) or [Hazelcast](https://github.com/helm/charts/tree/master/stable/hazelcast), you need to add the chart prefix name to the command line argument. For example:

```
--set postgresql.image.tag=latest --set hazelcast.cluster.memberCount=3 --set kafka.replicaCount=2 `
```

Please refer to the dependency chart's documentation to get the list of parameters.
{{< /alert >}}

#### Monitoring

Streams ships with monitoring. You can activate metrics with the parameters listed in the table above (under "Activate metrics endpoint"),
which will open endpoints designed to be scrapped by [Prometheus](https://prometheus.io).

{{< alert title="Note" >}}You may need to add CPU and memory to the containers.{{< /alert >}}

## Upgrade

To upgrade your Streams installation with a new minor version or update your configuration:

* Optional: update the `values.yaml` files with any custom configuration
* Upgrade your Streams installation:

```sh
export NAMESPACE="my-namespace"
export HELM_RELEASE_NAME="my-release"

helm upgrade "${HELM_RELEASE_NAME}" . [-f values.yaml] [-f values-ha.yaml] [--set key=value[,key=value]] -n "${NAMESPACE}"
```

Be careful, any difference in the `values.yaml` file or in the `--set` parameter from the initial installation will be upgraded too.
So, if you initially installed Streams with `-f values.yaml` or `-f values-ha.yaml`, you have to specify the same parameters for the upgrade.

Note that, to avoid downtime during the upgrade, it is recommended to have at least `2` replicas of each pod before upgrading the Chart.

After an upgrade, a rollback is possible with the following command:

```sh
export NAMESPACE="my-namespace"
export HELM_RELEASE_NAME="my-release"

helm rollback "${HELM_RELEASE_NAME}" -n "${NAMESPACE}"
```

## Uninstallation

To uninstall Streams, run following command:

```sh
export NAMESPACE="my-namespace"
export HELM_RELEASE_NAME="my-release"

helm uninstall "${HELM_RELEASE_NAME}" –n "${NAMESPACE}"
```

The command removes all the Kubernetes components associated with the chart and deletes the release.

Note that PersistentVolumeClaims required by Kafka and PostgreSQL are NOT deleted when the release is deleted. If you wish to delete them you can do it with the following command:

```sh
export NAMESPACE="my-namespace"

kubectl -n "${NAMESPACE}" get persistentvolumeclaims --no-headers=true | awk '/streams/{print $1}' | xargs kubectl delete -n "${NAMESPACE}" persistentvolumeclaims
```

## Backup & Disaster recovery

It is essential for the smooth operation of Streams to perform regular backups of data and configurations. There are two kinds of data that we encourage to backup:

* Configurations: Helm chart installation files - If you apply any modification to the default Streams helm chart, such as editing the values.yaml file, we recommend tracking the changes and back up the code in a source code repository. We recommend using git to address this point.
* Data: persistent volumes of Kubernetes services - We do not provide any procedure to backup/restore volume data as it will mainly depend on your iPaaS. Nevertheless, you can have a look at stash project that enables the backup/restore of stateful applications (PostgreSql, Kafka, Zookeeper) into AWS S3 buckets, for instance.

For a disaster recovery procedure, you should have access to cloud resources in another region. Using backed-up configurations/data and Streams helm chart, you should be able to run a new installation in a new Kubernetes cluster in another region.

{{< alert title="Note" >}}The information provided in this section are only guidelines to help you implement your own disaster recovery procedure which needs to take into consideration your own constraints and environments. When disaster strikes, you must be prepared with a run book of specific actions to take that are proven to work, considering your specific environments.{{< /alert >}}