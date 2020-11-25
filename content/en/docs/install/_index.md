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
* Resources:

    * Minimal non-HA configuration: `9` CPUs and `10` GB RAM dedicated to the platform.
    * Minimal HA configuration: `34` CPUs and `51` GB RAM dedicated to the platform.

{{< alert title="Note" >}}
Refer to the [Reference Architecture](/docs/architecture) documentation for further details.
{{< /alert >}}

## Pre-installation

Download Steams helm chart corresponding to the `release-version` you want to install.

```sh
export INSTALL_DIR="MyInstallDirectory"

cd ${INSTALL_DIR}/helm/streams
```

## Helm Chart installation

### Secrets management

Refer to Kubernetes documentation to create [secrets](https://kubernetes.io/docs/concepts/configuration/secret/).

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

### MariaDB settings

The MariaDB database is automatically installed by default on your K8s cluster with the Streams Helm chart. But using an external one is recommended in production.

To disable the MariaDB installation, you can either:

* Edit the `values.yaml` file and set the `mariadb.enabled` entry as follow:

```yaml
mariadb:
  enabled: false
```

* or specify `--set mariadb.enabled=false` in the Helm Chart installation command.

Then, according to your choice, configure your [external MariaDB](#external-mariadb-configuration) or your [automatically installed MariaDB](#helm-chart-mariadb-configuration).

#### External MariaDB configuration

First of all, you must create a database which will be used by Streams:

* Connect to you MariaDB and create the database:

```sh
export DB_HOST="my-db-host"
export DB_PORT="my-db-port"
export DB_USER="my-db-user"
export DB_NAME="streams"
mysql -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" -p -e "CREATE DATABASE ${DB_NAME};"
```

* Then, you should create a dedicated streams user:

```sh
export DB_HOST="my-db-host"
export DB_PORT="my-db-port"
export DB_USER="my-db-user"
export DB_STREAMS_USER="streams"
export DB_STREAMS_PASS="my-streams-db-password"
mysql -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" -p -e "CREATE USER IF NOT EXISTS '${DB_STREAMS_USER}'@'%' IDENTIFIED BY '${DB_STREAMS_PASS}';"
```

* This user should at least have the right to select, insert, update, and delete on Streams database. It's also recommended to force the TLS authentication for this user (`REQUIRE SSL`). You can grant this privileges with:

```sh
export DB_HOST="my-db-host"
export DB_PORT="my-db-port"
export DB_USER="my-db-user"
export DB_NAME="streams"
export DB_STREAMS_USER="streams"
mysql -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" -p -e "GRANT SELECT, INSERT, UPDATE, DELETE ON ${DB_NAME}.* TO ${DB_STREAMS_USER} REQUIRE SSL;"
```

Then you must provide information to the Streams installation. You should edit the `values.yaml` file and set the `externalMariadb` entry as follow:

```yaml
externalMariadb:
  host: "my-db-host"
  port: my-db-port
  db:
    name: "streams"
    user: "streams"
  rootUsername: "my-streams-db-root-user"
```

##### External MariaDB passwords

Passwords are required for Streams microservices to securely connect to Mariadb.

```sh
export NAMESPACE="my-namespace"
export MARIADB_ROOT_PASSWORD="my-mariadb-root-password"
export MARIADB_PASSWORD="my-mariadb-user-password"
kubectl create secret generic streams-database-passwords-secret --from-literal=mariadb-root-password=${MARIADB_ROOT_PASSWORD} --from-literal=mariadb-password=${MARIADB_PASSWORD} -n ${NAMESPACE}
```

##### External MariaDB TLS

For security purpose, it's highly recommended to enable TLS communication between your database and Streams microservices. You can enable [One-Way TLS](https://mariadb.com/kb/en/securing-connections-for-client-and-server/#enabling-one-way-tls-for-mariadb-clients) or [Two-Way TLS](https://mariadb.com/kb/en/securing-connections-for-client-and-server/#enabling-two-way-tls-for-mariadb-clients).

{{< alert title="Note" >}} If you use a provider for your MariaDB database, make sure the Two-Way method is available. (e.g. not available with AWS RDS).{{< /alert >}}

According to your choice, you must:

* For One-Way TLS:
    * Provide the CA certificate by creating a secret:
    ```sh
    export NAMESPACE="my-namespace"
    kubectl create secret generic streams-database-secret --from-file=CA_PEM=ca.pem -n ${NAMESPACE}
    ```
    * Set the [Helm parameters](#helm-parameters) `externalMariadb.tls.twoWay` to `false`.

* For Two-Way TLS:
    * Provide the CA certificate, the server certificate and the server key by creating a secret:
    ```sh
    export NAMESPACE="my-namespace"
    kubectl create secret generic streams-database-secret --from-file=CA_PEM=ca.pem --from-file=SERVER_CERT_PEM=server-cert.pem --from-file=SERVER_KEY_PEM=server-key.pem -n ${NAMESPACE}
    ```

* For no TLS:
    * Set the [Helm parameters](#helm-parameters) `externalMariadb.tls.enabled` to `false`.

You can follow the official documentation provided by Mariadb [Certificate Creation with OpenSSL](https://mariadb.com/kb/en/certificate-creation-with-openssl/) to generate self-signed certificate. Make sure to set the Common Name correctly.

#### Helm chart MariaDB configuration

##### Helm chart MariaDB passwords

Passwords are required for Streams microservices to securely connect to Mariadb.

```sh
export NAMESPACE="my-namespace"
export MARIADB_ROOT_PASSWORD="my-mariadb-root-password"
export MARIADB_PASSWORD="my-mariadb-user-password"
export MARIADB_REPLICATION_PASSWORD="my-mariadb-replication-password"
kubectl create secret generic streams-database-passwords-secret --from-literal=mariadb-root-password=${MARIADB_ROOT_PASSWORD} --from-literal=mariadb-password=${MARIADB_PASSWORD}  --from-literal=mariadb-replication-password=${MARIADB_REPLICATION_PASSWORD} -n ${NAMESPACE}
```

##### Helm chart MariaDB Security

By default, MariaDB is configured with [TLS communication](#tls) and [Transparent Data Encryption](#transparent-data-encryption-tde) enabled.

###### TLS

In order to configure the TLS communication between MariaDB and Streams microservices, you have to provide a CA certificate, a server certificate and a server key. The main requirement is that the server certificate's Common Name must be set up with *streams-database*.

You can follow the official documentation provided by Mariadb [Certificate Creation with OpenSSL](https://mariadb.com/kb/en/certificate-creation-with-openssl/) to generate self-signed certificate. *Remember to set the Common Name correctly.*

###### Transparent Data Encryption (TDE)

In order to configure the Mariadb data-at-rest encryption, you must provide a keyfile.
The keyfile must contain a 32-bit integer identifier followed by the hex-encoded encryption key separated by semicolon such as: `<encryption_key_id>`;`<hex-encoded_encryption_key>`.

To generate the keyfile, run the following command:

```sh
echo "1;$(openssl rand -hex 32)" > keyfile
```

###### MariaDB security configuration

Depending on your security choices, you must:

* For TLS and TDE:
    * Create a secret containing both [TLS](#tls) certificates and [TDE](#transparent-data-encryption-tde) keyfile:
    ```sh
    export NAMESPACE="my-namespace"
    kubectl create secret generic streams-database-secret --from-file=CA_PEM=ca.pem --from-file=SERVER_CERT_PEM=server-cert.pem --from-file=SERVER_KEY_PEM=server-key.pem --from-file=KEYFILE=keyfile -n ${NAMESPACE}
    ```

* For TLS only:
    * Create a secret containing the [TLS](#tls) certificates:
    ```sh
    export NAMESPACE="my-namespace"
    kubectl create secret generic streams-database-secret --from-file=CA_PEM=ca.pem --from-file=SERVER_CERT_PEM=server-cert.pem --from-file=SERVER_KEY_PEM=server-key.pem -n ${NAMESPACE}
    ```
    * Set the [Helm parameters](#helm-parameters) `mariadb.encryption.enabled` to `false`.

* For TDE only:
    * Create a secret containing the [TDE](#transparent-data-encryption-tde) keyfile:
    ```sh
    export NAMESPACE="my-namespace"
    kubectl create secret generic streams-database-secret --from-file=KEYFILE=keyfile -n ${NAMESPACE}
    ```
    * Set the [Helm parameters](#helm-parameters) `mariadb.tls.enabled` to `false`.

###### Disable MariaDB security features

To disable MariaDB encryption **and** TLS, you must set the following [Helm parameters](#helm-parameters):

* `mariadb.tls.enabled` and `mariadb.encryption.enabled` to `false`
* `mariadb.master.extraEnvVarsSecret` and `mariadb.slave.extraEnvVarsSecret` to `null`

{{< alert title="Note" >}}
Not recommended for production.
{{< /alert >}}

### Kafka security settings

By default, Kafka is configured with [SASL authentication](https://docs.confluent.io/current/kafka/authentication_sasl/index.html#authentication-with-sasl) and [TLS encryption](https://docs.confluent.io/current/kafka/encryption.html#encryption-with-ssl) for clients and brokers.
As there is no sensitive data in Zookeeper, the communications with Zookeeper are in plaintext without authentication.

#### SASL authentication

In order to have SASL authentication working, you need to create the following secret containing Kafka credentials:

```sh
export NAMESPACE="my-namespace"
export KAFKA_CLIENT_PASSWORD="my-kakfa-client-password"
export KAFKA_INTERBROKER_PASSWORD="my-kakfa-interbroker-password"

kubectl -n ${NAMESPACE} create secret generic streams-kafka-passwords-secret --from-literal="client-passwords=${KAFKA_INTERBROKER_PASSWORD},${KAFKA_CLIENT_PASSWORD}" --from-literal="inter-broker-password=${KAFKA_INTERBROKER_PASSWORD}" --from-literal="client-password=${KAFKA_CLIENT_PASSWORD}"
```

#### TLS encryption

In order to configure TLS encryption, you need to have a valid truststore and one certificate per broker. They must all be integrated into Java Key Stores (JKS) files.
Be careful as each broker needs its own keystore and a dedicated CN name matching the Kafka pod hostname as described in [bitnami documentation](https://github.com/bitnami/charts/tree/master/bitnami/kafka#enable-security-for-kafka-and-zookeeper).
We provide you with a script to help with truststore and keystore generation (based on bitnami's script that properly handles Kubernetes deployment).
You can also use your own truststore/privatekey:

```sh
cd tools
./kafka-generate-ssl.sh
```

Then, create a secret which contains all the previously generated files:

```sh
export NAMESPACE="my-namespace"
export KAFKA_SECRET_PASSWORD="my-kakfa-secret-password"
kubectl -n ${NAMESPACE} create secret generic streams-kafka-client-jks-secret --from-file="./truststore/kafka.truststore.jks" --from-file=./keystore/kafka-0.keystore.jks --from-file=./keystore/kafka-1.keystore.jks --from-file=./keystore/kafka-2.keystore.jks --from-literal="jks-password=${KAFKA_SECRET_PASSWORD}"
```

#### Disable Kafka security features

To disable Kafka security features, you need to find & replace in `values.yaml` and `values-ha.yaml` all occurences of the following:

```sh
--streams.kafka.security-config.security-protocol="SASL_SSL"
```

by the following:

```sh
--streams.kafka.security-config.security-protocol="PLAINTEXT"
```

and set the following parameters in `values.yaml` to these values (leave other parameters unchanged):

```sh
kafka:
  auth:
    tls:
      enabled: false
    clientProtocol: plaintext
    interBrokerProtocol: plaintext
    saslInterBrokerMechanism: plain
# Comment the lines as follows
# extraEnvVars:
#   - name: KAFKA_CERTIFICATE_PASSWORD
#     valueFrom:
#       secretKeyRef:
#         name: "streams-kafka-client-jks-secret"
#         key: "jks-password"
```

{{< alert title="Note" >}}
Do not use for production.
{{< /alert >}}

### Ingress TLS settings

SSL/TLS is enabled by default on the embedded Ingress controller. If you don't provide any certificate, SSL will be enabled thanks to a nginx embedded fake SSL certificate.
You can provide an SSL/TLS certificate for the domain name you are using (either CN or SAN fields should match the `ingress.host` [Helm parameter](#helm-parameters)):

```sh
export NAMESPACE="my-namespace"
export INGRESS_TLS_KEY_PATH="my-key-path"
export INGRESS_TLS_CHAIN_PATH="my-chain-path"

kubectl create secret tls streams-ingress-tls-secret --key=${INGRESS_TLS_KEY_PATH} --cert="${INGRESS_TLS_CHAIN_PATH}" -n "${NAMESPACE}"
```

To disable SSL/TLS (not recommended for production use), see [Helm parameters](#helm-parameters).

### Helm install command

#### Non HA configuration

The command below deploys Streams components in a non-HA configuration with 1 replica per microservices (not recommended for production use). This can take a few minutes.

```sh
export NAMESPACE="my-namespace"
export HELM_RELEASE_NAME="my-release"

helm install "${HELM_RELEASE_NAME}" . \
  [--set <parameter>=<value>] \
  -f values.yaml \
  -n "${NAMESPACE}"
```

#### HA configuration

The command below deploys Streams on the Kubernetes cluster in High availability (recommend for production).  This can take a few minutes.
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
Refer to [Ingress host configuration](#ingress-host-configuration) and [Helm parameters](#helm-parameters) for further details.
{{< /alert >}}

#### Ingress host configuration

{{< alert title="Note" >}}
Do not use for production.
{{< /alert >}}

The ingress controller automatically deploys a load balancer on the underlying infrastructure. You may want to use its auto-generated DNS if you are not all set for production yet.
If this is the case, after the installation has been performed, you can edit the `streams` ingress resource and replace the host `k8s.yourdomain.tld` with the auto-generated DNS of your load balancer.

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
streams-kafka-0                                                1/1     Running   0          116s
streams-mariadb-master-0                                       1/1     Running   0          116s
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
As the provided environment is configured with localhost, you may need to reconfigure it with your own DNS, for instance `baseUrl` will be changed from `http://localhost:9001` to `https://k8s.yourdomain.tld` and so on for other variables.
2. Try to subscribe with SSE to your topic:

```sh
curl "https://k8s.yourdomain.tld/subscribers/sse/topics/{TOPIC_ID}"
```

{{< alert title="Note" >}}
The default configuration only accepts incoming HTTP/HTTPS requests to `k8s.yourdomain.tld`.
Refer to the [Helm parameters](#helm-parameters) for further details.
{{< /alert >}}

#### Helm parameters

##### Streams parameters

| Parameter                             | Description                         | Mandatory | Default value |
| ------------------------------------- | ----------------------------------- | --------- | ------------- |
| hub.replicaCount                      | Hub replica count                   | no        | 2             |
| hub.ports.containerPort               | Http port to reach the Streams Topics API | no  | 8080          |
| subscriberWebhook.replicaCount        | Subscriber Webhook replica count    | no        | 2             |
| subscriberWebhook.ports.containerPort | Http port to subscribe to a topic   | no        | 8080          |
| publisherHttpPoller.replicaCount      | Publisher HTTP Poller replica count | no        | 2             |
| publisherHttpPost.enabled             | Enable/Disable Publisher HTTP Post  | no        | true          |
| publisherHttpPost.replicaCount        | Publisher HTTP Post replica count   | no        | 2             |
| publisherHttpPost.ports.containerPort | Http port to publish to a topic     | no        | 8080          |
| publisherKafka.enabled                | Enable/Disable Publisher Kafka      | no        | true          |
| publisherKafka.replicaCount           | Publisher Kafka replica count       | no        | 2             |
| publisherSfdc.enabled                 | Enable/Disable Publisher SFDC       | no        | false         |
| publisherSfdc.replicaCount            | Publisher SFDC replica count        | no        | 2             |
| actuator.prometheus.enabled           | Activate metrics endpoints for Streams services | no | false    |

##### MariaDB parameters

| Parameter                             | Description                         | Mandatory | Default value |
| ------------------------------------- | ----------------------------------- | --------- | ------------- |
| mariadb.enabled                       | MariaDB installed in K8s with the Helm chart. If set to false, the `externalMariadb` parameter will be used | no | true |
| mariadb.tls.enabled                   | MariaDB TLS enabled                 | no        | true          |
| mariadb.encryption.enabled            | MariaDB Transparent Data Encryption enabled | no | true         |
| mariadb.metrics.enabled               | Activate metrics endpoint for MariaDB | no      | false         |
| externalMariadb.host                  | Host of the external Mariadb (Only used when `mariadb.enabled` set to false) | no | my.db.host |
| externalMariadb.port                  | Port of the external Mariadb (Only used when `mariadb.enabled` set to false) | no | 3306 |
| externalMariadb.db.name               | Name of the MySQL database used for Streams (Only used when `mariadb.enabled` set to false) | no | streams |
| externalMariadb.db.user               | Username of the external Mariadb used by Streams (Only used when `mariadb.enabled` set to false) | no | streams |
| externalMariadb.rootUsername          | Root username of the external Mariadb used by Streams (Only used when `mariadb.enabled` set to false) | no | root |
| externalMariadb.tls.enabled           | External MariaDB tls enabled (Only used when `mariadb.enabled` set to false) | no | true |
| externalMariadb.tls.twoWay            | External MariaDB Two-Way tls enabled (Only used when `mariadb.enabled` set to false) | no | true |

##### Kafka parameters

| Parameter                             | Description                         | Mandatory | Default value |
| ------------------------------------- | ----------------------------------- | --------- | ------------- |
| kafka.metrics.jmx.enabled             | Activate metrics endpoint for Kafka | no        | false         |

##### Zookeeper parameters

| Parameter                             | Description                         | Mandatory | Default value |
| ------------------------------------- | ----------------------------------- | --------- | ------------- |
| zookeeper.metrics.enabled             | Activate metrics endpoint for Zookeeper | no    | false         |

##### Ingress parameters

| Parameter                             | Description                         | Mandatory | Default value |
| ------------------------------------- | ----------------------------------- | --------- | ------------- |
| ingress-nginx.enabled                 | Enable/Disable NGINX                | no        | true          |
| ingress.host | Domain name used for incoming HTTP requests if `ingress-nginx.enabled` is set to true | no | k8s.yourdomain.tld |
| ingress.tlsenabled                    | Enable embedded ingress SSL/TLS     | no        | true          |
| ingress.tlsSecretName                 | Embedded ingress SSL/TLS certificate secret name | no | streams-ingress-tls-secret |
| ingress-nginx.controller.metrics.enabled | Activate metrics endpoint for Ingress controller | no | false |

{{< alert title="Note" >}}
If you want to configure a parameter from a dependency chart, [MariaDB](https://github.com/bitnami/charts/tree/master/bitnami/mariadb), [Kafka](https://github.com/bitnami/charts/tree/master/bitnami/kafka), you need to add the chart prefix name to the command line argument. For example:

```
--set mariadb.image.tag=latest --set kafka.replicaCount=2 `
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

helm uninstall "${HELM_RELEASE_NAME}" -n "${NAMESPACE}"
```

The command removes all the Kubernetes components associated with the chart and deletes the release.

Note that PersistentVolumeClaims required by Kafka and MariaDB are NOT deleted when the release is deleted. If you wish to delete them you can do it with the following command:

```sh
export NAMESPACE="my-namespace"

kubectl -n "${NAMESPACE}" get persistentvolumeclaims --no-headers=true | awk '/streams/{print $1}' | xargs kubectl delete -n "${NAMESPACE}" persistentvolumeclaims
```

Similarly, all [secrets](#secrets-management) created for the Streams release installation aren't deleted either with the release uninstallation. To delete them, you can run the following command:

```sh
export NAMESPACE="my-namespace"
export REGISTRY_SECRET_NAME="my-registry-secret-name"

kubectl -n "${NAMESPACE}" delete secrets "${REGISTRY_SECRET_NAME}" streams-database-passwords-secret streams-database-secret streams-kafka-passwords-secret streams-kafka-client-jks-secret streams-ingress-tls-secret
```

## Backup & Disaster recovery

It is essential for the smooth operation of Streams to perform regular backups of data and configurations. There are two kinds of data that we encourage to backup:

* Configurations: Helm chart installation files - If you apply any modification to the default Streams helm chart, such as editing the values.yaml file, we recommend tracking the changes and back up the code in a source code repository. We recommend using git to address this point.
* Data: persistent volumes of Kubernetes services - We do not provide any procedure to backup/restore volume data as it will mainly depend on your iPaaS. Nevertheless, you can have a look at stash project that enables the backup/restore of stateful applications (MariaDB, Kafka, Zookeeper) into AWS S3 buckets, for instance.

For a disaster recovery procedure, you should have access to cloud resources in another region. Using backed-up configurations/data and Streams helm chart, you should be able to run a new installation in a new Kubernetes cluster in another region.

{{< alert title="Note" >}}The information provided in this section are only guidelines to help you implement your own disaster recovery procedure which needs to take into consideration your own constraints and environments. When disaster strikes, you must be prepared with a run book of specific actions to take that are proven to work, considering your specific environments.{{< /alert >}}