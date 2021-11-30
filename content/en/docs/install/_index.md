---
title: Install Streams
linkTitle: Install Streams
weight: 7
date: 2021-02-18
hide_readingtime: true
no_list: true
description: Learn how to install Streams on-premise or deploy it in your private cloud, configure a helm chart, and validate the installation.
---

This section covers recommanded steps to install Streams either on development environment or production environment.

## Prerequisites

* Kubernetes 1.18+
* [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)
* Helm 3.2.0+
* RBAC enabled
* PersistentVolumes and LoadBalancer provisioner supported by the underlying infrastructure
* Resources:
    * Minimal non-HA configuration: `9` CPUs and `10` GB RAM dedicated to the platform.
    * Minimal HA configuration: `34` CPUs and `51` GB RAM dedicated to the platform.

For more information, see [Reference Architecture](/docs/architecture).

## Prepare your environment

After you have been on-boarded on [Amplify Platform](https://platform.axway.com), you will be able to download our latest Helm chart from the **Downloads** section of [Axway Support Portal](https://support.axway.com/en/search/index/type/Downloads/sort/created%7Cdesc/ipp/10/product/596/version/3074). Ensure to download the correct version of the Streams Helm chart corresponding to the release you wish to install.

To prepare your environment, extract the Helm chart and open a terminal from the extracted directory.

{{< alert title="Note" >}}You can find others resources in [Axway Support Portal](https://support.axway.com/en), for example, Postman collections, OpenAPI, and Docker-compose files, which can help you to configure your environment or test Streams.{{< /alert >}}

## Manage your Helm parameters properly

We recommand to create a custom values file (for example, `my-values.yaml`) where you can overwrite parameters and pass on the file to `helm install` or `helm upgrade` command by using `-f my-values.yaml` option.

For alternate methods, see [Alternate methods to manage Helm parameters](/docs/install/customize-install#alternate-methods-to-manage-helm-parameters) section.

## General conditions for license and subscription services

Axway products and services are governed exclusively by Axway's [General Terms and Conditions](https://www.axway.com/en/legal/contract-documents). To accept them, set the helm value `acceptGeneralConditions` to `"yes"` and proceed with the installation. Ensure to add the double quotation around the `yes` flag.

## Kubernetes namespace

We recommend you deploy Streams components inside a dedicated namespace. To create a namespace, run the following command:

```sh
export NAMESPACE="my-namespace"
kubectl create namespace "${NAMESPACE}"
```

## Configure a Docker registry

Docker images must be hosted in a docker registry accessible from your Kubernetes cluster. We recommand to use Amplify Platform repository, for custom docker registry, see [Use a custom Docker registry](/docs/install/customize-install#use-a-custom-docker-registry) section.

### Use Amplify Platform as your Docker registry

To use the Amplify Platform as your container registry you must first ensure the following:

* You can see our images with your organization on the Amplify repository search page.
* You have administrator access to create a service account in your organization.

After you have verified that, you must create a service account, then create docker-registry secret with the information from your service account.

#### Create a service account

To create your service account perform the following steps:

1. Log in to the [Amplify Platform](https://platform.axway.com).
2. Select to your organization and from the left menu, click **Service Accounts** (You should see all service accounts already created).
3. Click **+ Service Account**, and fill in the mandatory fields:
    * Enter a name for the service account.
    * Choose `Client Secret` for the method.
    * Choose `Platform-generated secret` for the credentials.
4. Click **Save**
5. Ensure to securely store the generated client secret because it will be required in further steps.

#### Create a secret

To create your secret to use with the Amplify platform docker-registry, run the following command with the service account information:

```sh

export NAMESPACE="my-namespace"
export REGISTRY_SECRET_NAME="my-registry-secret-name"
export REGISTRY_USERNAME="my-service-account-client-id"
export REGISTRY_PASSWORD="my-service-account-client-secret"
export REGISTRY_SERVER="repository.axway.com"

kubectl create secret docker-registry "${REGISTRY_SECRET_NAME}" --docker-server="${REGISTRY_SERVER}"  --docker-username="${REGISTRY_USERNAME}" --docker-password="${REGISTRY_PASSWORD}" -n "${NAMESPACE}"
```

To use your Kubernetes Secret in the registry, add the Secret's name in the `imagePullSecrets` array. For example, add `--set imagePullSecrets[0].name="${REGISTRY_SECRET_NAME}"` to the Helm chart installation command.

## Configuration for development environment

For a quick installation of Streams, the default settings target a development environment. For production environment settings, see [dedicated section](#Configuration-for-production-environment).

### Embedded MariaDB settings

By default, an embedded MariaDB database is installed on your K8s cluster next to Streams.

#### Embedded MariaDB credentials

Passwords are required for Streams microservices to securely connect to an embedded Mariadb.

In order to set your database passwords, you need to create a secret including your passwords, for example:

```sh
export NAMESPACE="my-namespace"
export MARIADB_ROOT_PASSWORD="my-mariadb-root-password"
export MARIADB_PASSWORD="my-mariadb-user-password"
export MARIADB_REPLICATION_PASSWORD="my-mariadb-replication-password"

kubectl create secret generic streams-database-passwords-secret --from-literal=mariadb-root-password=${MARIADB_ROOT_PASSWORD} --from-literal=mariadb-password=${MARIADB_PASSWORD}  --from-literal=mariadb-replication-password=${MARIADB_REPLICATION_PASSWORD} -n ${NAMESPACE}
```

#### Embedded MariaDB security

By default, MariaDB is configured with [TLS communication](#tls-communication) and [Transparent Data Encryption](#transparent-data-encryption-tde) enabled.

To customize security settings, see
 [Custom embedded Mariadb security settings](/docs/install/customize-install#custom-embedded-mariadb-security-settings) section.

##### TLS communication

To configure the TLS communication between MariaDB and Streams microservices, provide a CA certificate, a server certificate, and a server key.

For more information, see the official documentation provided by Mariadb, [Certificate Creation with OpenSSL](https://mariadb.com/kb/en/certificate-creation-with-openssl/), to generate a self-signed certificate.

{{< alert title="Note" >}}
The server certificate's Common Name must be set up with *streams-database*.
{{< /alert >}}

##### Transparent Data Encryption (TDE)

To configure the Mariadb data-at-rest encryption, you must provide a keyfile. The keyfile must contain a 32-bit integer identifier followed by the hex-encoded encryption key separated by semicolon. For example, `<encryption_key_id>`;`<hex-encoded_encryption_key>`.

To generate the keyfile, run the following command:

```sh
echo "1;$(openssl rand -hex 32)" > keyfile
```

##### MariaDB security secret

In order to enable TLS and TDE on mariadb, you must to create a k8s secret. For example:

 ```sh
export NAMESPACE="my-namespace"
kubectl create secret generic streams-database-secret --from-file=CA_PEM=ca.pem --from-file=SERVER_CERT_PEM=server-cert.pem --from-file=SERVER_KEY_PEM=server-key.pem --from-file=KEYFILE=keyfile -n ${NAMESPACE}
```

#### Performance tuning

The following embedded MariaDB configuration values can be updated:

* `wait-timeout` - update by setting the [Helm parameters](/docs/install/helm-parameters-reference/) `embeddedMariadb.waitTimeout`.
* `max-connections` - updated by setting the [Helm parameters](/docs/install/helm-parameters-reference/) `embeddedMariadb.maxConnections`.

For more information, see [database considerations](/docs/architecture#database-considerations).

### Embedded Kafka settings

By default, an embedded Kafka cluster is installed on your K8s cluster next to Streams.

#### Embedded Kafka security

For security purposes, we strongly recommend to enable [SASL authentication](https://docs.confluent.io/current/kafka/authentication_sasl/index.html#authentication-with-sasl) and [TLS encryption](https://docs.confluent.io/current/kafka/encryption.html#encryption-with-ssl) for Kafka clients and brokers.

To find alternate security settings, see
 [Custom embedded kafka security settings](/docs/install/customize-install#custom-embedded-kafka-security-settings) section.

SASL and TLS are enabled by default. As there is no sensitive data in Zookeeper, the communications with Zookeeper are in plaintext without authentication.

To configure SASL authentication, you must create a k8S secret with your kafka credentials, for example:

```sh
export NAMESPACE="my-namespace"
export KAFKA_CLIENT_PASSWORD="my-kakfa-client-password"
export KAFKA_INTERBROKER_PASSWORD="my-kakfa-interbroker-password"

kubectl -n ${NAMESPACE} create secret generic streams-kafka-passwords-secret --from-literal="client-passwords=${KAFKA_CLIENT_PASSWORD}" --from-literal="inter-broker-password=${KAFKA_INTERBROKER_PASSWORD}"
```

Then to configure TLS encryption, you must have a valid truststore and one certificate per broker. They must all be integrated into Java Key Stores (JKS) files. Be careful, as each broker needs its own keystore and a dedicated CN name matching the Kafka pod hostname as described in the [bitnami documentation](https://github.com/bitnami/charts/tree/master/bitnami/kafka#enable-security-for-kafka-and-zookeeper).

In order to facilate this configuration, we provide you with a script to help with truststore and keystore generation (based on bitnami's script that properly handles Kubernetes deployment). For example:

```sh
cd tools
./kafka-generate-ssl.sh
```

Once you keystore and certifactes are created, you must create a secret, which contains all the previously generated files:

```sh
export NAMESPACE="my-namespace"
export KAFKA_SECRET_PASSWORD="my-kakfa-secret-password"
kubectl -n ${NAMESPACE} create secret generic streams-kafka-client-jks-secret --from-file="./truststore/kafka.truststore.jks" --from-file=./keystore/kafka-0.keystore.jks --from-file=./keystore/kafka-1.keystore.jks --from-file=./keystore/kafka-2.keystore.jks --from-literal="jks-password=${KAFKA_SECRET_PASSWORD}"
```

## Configuration for production environment

### MariaDB settings

By default, an embedded MariaDB database is installed on your K8s cluster next to Streams. For production, we recommend that you use an externalized database instead.

To disable embedded MariaDB installation, set `embeddedMariadb.enabled` to `false`.

#### Externalized MariaDB configuration

To configure an external MariaDB database:

1. Connect to you MariaDB and create a database, which will be used by Streams:

    ```sh
    export DB_HOST="my-db-host"
    export DB_PORT="my-db-port"
    export DB_USER="my-db-user"
    export DB_NAME="streams"
    
    mysql -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" -p -e "CREATE DATABASE ${DB_NAME};"
    ```

2. Create a dedicated streams user:

    ```sh
    export DB_HOST="my-db-host"
    export DB_PORT="my-db-port"
    export DB_USER="my-db-user"
    export DB_STREAMS_USER="streams"
    export DB_STREAMS_PASS="my-streams-db-password"
    
    mysql -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" -p -e "CREATE USER IF NOT EXISTS '${DB_STREAMS_USER}'@'%' IDENTIFIED BY '${DB_STREAMS_PASS}';"
    ```

3. The user should have rights to select, insert, update, and delete on Streams database. It is also recommended to force the TLS authentication for this user. You can grant these privileges by running the following:

    ```sh
    export DB_HOST="my-db-host"
    export DB_PORT="my-db-port"
    export DB_USER="my-db-user"
    export DB_NAME="streams"
    export DB_STREAMS_USER="streams"
    
    mysql -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" -p -e "GRANT SELECT, INSERT, UPDATE, DELETE ON ${DB_NAME}.* TO ${DB_STREAMS_USER} REQUIRE SSL;"
    ```

4. Provide the connectivity information to the Streams installation, by setting the [Helm parameter](/docs/install/helm-parameters-reference/#mariadb-parameters):

    * `externalizedMariadb.host`
    * `externalizedMariadb.port`
    * `externalizedMariadb.rootUsername`

5. Set the [Helm parameter](/docs/install/helm-parameters-reference/#streams-parameters) `streams.serviceArgs.spring.datasource.hikari.maxLifetime` to a value (in seconds) according to the `wait-timeout` value of your MariaDB database. For more information, see [Database considerations](/docs/architecture#database-considerations).

#### Externalized MariaDB credentials

Passwords are required for Streams microservices to securely connect to Mariadb.

In order to set your database passwords, you need to create a secret including your passwords, for example:

```sh
export NAMESPACE="my-namespace"
export MARIADB_ROOT_PASSWORD="my-mariadb-root-password"
export MARIADB_PASSWORD="my-mariadb-user-password"

kubectl create secret generic streams-database-passwords-secret --from-literal=mariadb-root-password=${MARIADB_ROOT_PASSWORD} --from-literal=mariadb-password=${MARIADB_PASSWORD} -n ${NAMESPACE}
```

#### Externalized MariaDB TLS

For security purposes, it is highly recommended to enable TLS communication between your database and Streams microservices.

One-Way TLS is the most use mode and could be enabled with for example:

* Provide the CA certificate by creating a secret:

```sh
export NAMESPACE="my-namespace"
kubectl create secret generic streams-database-secret --from-file=CA_PEM=ca.pem -n ${NAMESPACE}
```

* Set the [Helm parameters](/docs/install/helm-parameters-reference/) `externalizedMariadb.tls.twoWay` to `false`.

For more information, see the official documentation provided by MariaDB, [Certificate Creation with OpenSSL](https://mariadb.com/kb/en/certificate-creation-with-openssl/), to generate self-signed certificates. Make sure to set the `Common Name` correctly.

To find alternate security settings, see
 [Custom externalized Mariadb security settings](/docs/install/customize-install#custom-externalized-mariadb-security-settings) section.

### Externalized Kafka settings

By default, an embedded Kafka cluster is installed on your K8s cluster next to Streams. For production environments, we recommend that you use an externalized Kafka instead.

To disable the embedded Kafka installation and use a externalized kafka cluster, set [Helm parameters](/docs/install/helm-parameters-reference/#kafka-parameters) `embeddedKafka.enabled` to `false`.

#### Externalized Kafka topics settings

Ensure that `delete.topic.enable` is set to `true` in your [Kafka](https://kafka.apache.org/documentation/#upgrade_100_notable) installation.

#### Externalized Kafka configuration

You must provide connectivity information to the Streams installation by specifying the [Helm parameters](/docs/install/helm-parameters-reference/#kafka-parameters) `externalizedKafka.bootstrapServers`.

#### Externalized Kafka security settings

For security purposes, we strongly recommend to enable [SASL authentication](https://docs.confluent.io/current/kafka/authentication_sasl/index.html#authentication-with-sasl) and [TLS encryption](https://docs.confluent.io/current/kafka/encryption.html#encryption-with-ssl) for Kafka clients and brokers.

To disable security settings, see [Disable externalized kafka security settings](/docs/install/customize-install#disable-externalized-kafka-security-settings) section.

To configure SASL authentication, you must create a k8S secret with your kafka credentials, for example

```sh
export NAMESPACE="my-namespace"
export KAFKA_USER_PASSWORD="my-kafka-password"

kubectl create secret generic streams-kafka-passwords-secret --from-literal=client-passwords=${KAFKA_USER_PASSWORD} -n ${NAMESPACE}
```

Then you must provide a JKS containing the Kafka TLS truststore and its password:

```sh
export NAMESPACE="my-namespace"
export KAFKA_JKS_PASSWORD="my-kafka-jks-password"
export KAFKA_JKS_PATH="my-kafka-jks-path"

kubectl create secret generic streams-kafka-client-jks-secret --from-file=kafka.truststore.jks=${KAFKA_JKS_PATH} --from-literal=jks-password=${KAFKA_JKS_PASSWORD} -n ${NAMESPACE}
```

Finaly, you must set the [Helm parameters](/docs/install/helm-parameters-reference/#kafka-parameters) `externalizedKafka.auth.clientUsername` with your Kafka username.

## Ingress settings

An ingress controller is installed on your K8s cluster next to Streams.

### Load Balancer settings

Depending on your Cloud provider, deploying a load balancer might require additional parameters. Refer to your own Cloud provider for further details.

For example, if you are using AWS, you must define the load balancer by setting the [Helm parameter](/docs/install/helm-parameters-reference/) `nginx-ingress-controller.service.annotations."service.beta.kubernetes.io/aws-load-balancer-type"` to `nlb`.

For more information on the load balancer types, see [Reference Architecture](/docs/architecture#load-balancer).

### Ingress hostname

You must specify a hostname for the ingress installed with Streams helm chart. In order to do so, you must set the [Helm parameters](/docs/install/helm-parameters-reference/#ingress-parameters) `ingress.host` parameter to specify the hostname.

As it is a mandatory settings, if you do not have a hostname yet, use a temporary value and edit it later. In most case a DNS name will be generated after the installation by your cloud provider load balancer. In order to update the ingress host from it, execute the followings:

```sh
export NAMESPACE="my-namespace"
kubectl get ingress -o=jsonpath='{.items[?(@.metadata.name=="streams-hub")].status.loadBalancer.ingress[0].hostname}' -n ${NAMESPACE}
```

Then upgrade your Streams installation with the [Helm parameters](/docs/install/helm-parameters-reference/#ingress-parameters) `ingress.host` set with the DNS name retrieved previously (refer to the [Helm upgrade](/docs/install/upgrade/) for further details).

{{< alert title="Note" >}} _k8s.yourdomain.tld_ is used throughout this documentation as an example hostname value.{{< /alert >}}

### Ingress TLS

SSL/TLS is enabled by default on the embedded Ingress controller with a auto-generated certificate. If you want to provive your own, see [Custom ingress controller security settings](/docs/install/customize-install#custom-ingress-controller-security-settings) section.

### Ingress CORS

Cross-Origin Resource Sharing (CORS) is disabled by default. If you want to enable it, see
 [Custom ingress controller CORS](/docs/install/customize-install#custom-ingress-controller-cors) section.

## Monitor your installation

Streams ships with monitoring. You can activate metrics with the parameters listed in [Monitoring parameters](/docs/install/helm-parameters-reference/#monitoring-parameters), which will open endpoints designed to be scrapped by [Prometheus](https://prometheus.io).

{{< alert title="Note" >}}Enabling monitoring may increase CPU and memory loads.{{< /alert >}}

## Add self-signed TLS certificates

TLS endpoints to which Streams services connect must have a valid TLS certificate. If your endpoints uses self-signed certificates, you must add them to Streams services as trusted certificates.

Get ready with your certificates in PEM format and:

* Create one or several secrets containing your PEM files:

```sh
export NAMESPACE="my-namespace"
export SECRET_NAME="my-secret"
export PEM_PATH="my-pem-path"

kubectl create secret generic "${SECRET_NAME}" -n "${NAMESPACE}" --from-file="${PEM_PATH}" [--from-file=<other-pem-path>]
```

* Set the [Helm parameters](/docs/install/helm-parameters-reference/) `streams.extraCertificatesSecrets` to your `$SECRET_NAME`. If you have more than one secrets, they must be separated by a comma.

## Customize your installation

Optional [Helm parameters](/docs/install/helm-parameters-reference/) can be specified to customize the installation according to your needs.

You can also find specific customization, see [Customize installation](/docs/install/customize-install) section.

## Helm install command

You can deploy Streams in non-HA or HA configurations.

### Non-High availability configuration (not recommended for production use)

The following command deploys Streams components in a non-HA configuration with one replica per microservices . This might take a few minutes.

```sh
export NAMESPACE="my-namespace"
export HELM_RELEASE_NAME="my-release"

helm install "${HELM_RELEASE_NAME}" . \
  -f values.yaml \
  -n "${NAMESPACE}"
```

### High availability configuration (recommend for production)

The following command deploys Streams on the Kubernetes cluster in High availability . This might take a few minutes.

```sh
export NAMESPACE="my-namespace"
export HELM_RELEASE_NAME="my-release"

helm install "${HELM_RELEASE_NAME}" . \
  -f values.yaml \
  -f values-ha.yaml \
  -n "${NAMESPACE}"
```

## Validate the installation

If Streams is successfully installed, the output of the `helm install` command should look like the following (for non-HA configuration):

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
my-release-nginx-ingress-controller-58bfd85658-6plf5           1/1     Running   0          116s
my-release-publisher-http-poller-6cc5cd9fc6-q564p              1/1     Running   0          116s
my-release-publisher-http-post-5b745f864-dpws8                 1/1     Running   0          116s
my-release-subscriber-sse-7fd8c56f48-wvgtq                     1/1     Running   0          116s
my-release-subscriber-webhook-84469bd68f-lqxgk                 1/1     Running   0          116s
[...]
```

To check that Streams is running:

1. Import the provided Postman collections and environments.
2. Select the environment designed for Kubernetes (instead of localhost). It has a variable named `loadBalancerBaseUrl` with the value `<SET_YOUR_HOSTNAME>`. Change this to your hostname (for example, `https://k8s.yourdomain.tld`).
3. Create a topic with default settings.
4. Try to subscribe with SSE to your topic:

    ```sh
    curl "https://k8s.yourdomain.tld/streams/subscribers/sse/api/v1/topics/{TOPIC_ID}"
    ```

{{< alert title="Note" >}}
The default configuration only accepts incoming HTTP/HTTPS requests to `k8s.yourdomain.tld`. For more information, see [Helm parameters](/docs/install/helm-parameters-reference/).
{{< /alert >}}
