---
title: Install Streams
linkTitle: Install Streams
weight: 7
date: 2021-02-18
hide_readingtime: true
no_list: true
description: Learn how to install Streams on-premise or deploy it in your private cloud, configure a helm chart, and validate the installation.
---

This section covers recommended steps to install Streams either on development environment or production environment.

## Prerequisites

* Kubernetes 1.19+
* [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)
* Helm 3.2.0+
* RBAC enabled
* PersistentVolumes and LoadBalancer provisioner supported by the underlying infrastructure
* Resources:
    * Minimal non-HA configuration: `9` CPUs and `10` GB RAM dedicated to the platform.
    * Minimal HA configuration: `34` CPUs and `51` GB RAM dedicated to the platform.

For more information, see [Reference Architecture](/docs/architecture).

## Prepare your environment

After you have been onboarded on [Amplify Platform](https://platform.axway.com), you will be able to download our latest Helm chart from the **Downloads** section of the [Axway Support](https://support.axway.com/en/search/index/type/Downloads/sort/created%7Cdesc/ipp/10/product/596/version/3074) portal. Ensure to download the correct version of the Streams Helm chart corresponding to the release you wish to install.

To prepare your environment, extract the Helm chart and open a terminal from the extracted directory.

{{< alert title="Note" >}}You can find others resources in the [Axway Support](https://support.axway.com/en) portal, for example, Postman collections, OpenAPI, and Docker Compose files, which can help you to configure your environment or test Streams.{{< /alert >}}

## Prepare customizations

You must use Helm parameters to customize Streams during its installation. Any customization must be done before you install Helm.

To customize your installation, we recommend you to create a custom values file (for example, `my-values.yaml`) where you can overwrite parameters and pass on the file to the installation or upgrade commands by using the `-f` option. For example:

```
helm install -f my-values.yaml
```

For alternate methods to customize your installation, see [Customize installation](/docs/install/customize-install).

## Accept general conditions for license and subscription services

To proceed with the installation, you must accept Axway General Terms and Conditions:

*"You hereby accept that the Axway Products and/or Services shall be governed exclusively by the [Axway General Terms and Conditions](https://cdn.axway.com/u/Axway_General_Conditions_version_april_2014_eng%20(France).pdf), unless an agreement has been signed with Axway in which case such agreement shall apply."*

To accept the conditions. you must set the helm value `acceptGeneralConditions` to `"yes"`. Ensure to add the double quotation around the `yes` flag.

## Kubernetes namespace

We recommend you deploy Streams components inside a dedicated namespace. To create a namespace, run the following command:

```sh
export NAMESPACE="my-namespace"
kubectl create namespace "${NAMESPACE}"
```

## Use Amplify Platform as your Docker registry

Docker images must be hosted in a docker registry accessible from your Kubernetes (K8s) cluster. We recommend you to use the Amplify Platform repository for a custom docker registry. Alternatively, you can use [your own custom Docker registry](/docs/install/customize-install#use-a-custom-docker-registry).

To use the Amplify Platform as your container registry you must first ensure the following:

* You can see our images with your organization on the Amplify repository search page.
* You have administrator access to create a service account in your organization.

After you have verified that your images are loaded and that you have the correct level of access, you must create a service account, then create docker-registry secret with the information from your service account.

### Create a service account

To create your service account, perform the following steps:

1. Log in to the [Amplify Platform](https://platform.axway.com).
2. Select your organization, and from the left menu, click **Service Accounts** (You should see all service accounts already created).
3. Click **+ Service Account**, and fill in the mandatory fields:
    * Enter a name for the service account.
    * Choose `Client Secret` for the method.
    * Choose `Platform-generated secret` for the credentials.
4. Click **Save**
5. Ensure to securely store the generated client secret because it will be required in further steps.

### Create a secret

To create a secret to use with the Amplify platform docker-registry, run the following command with the service account information:

```sh
export NAMESPACE="my-namespace"
export REGISTRY_USERNAME="my-service-account-client-id"
export REGISTRY_PASSWORD="my-service-account-client-secret"
export REGISTRY_SERVER="docker.repository.axway.com"

kubectl create secret docker-registry streams-docker-registry-secret --docker-server="${REGISTRY_SERVER}"  --docker-username="${REGISTRY_USERNAME}" --docker-password="${REGISTRY_PASSWORD}" -n "${NAMESPACE}"
```

## Configuration for development environment

For a quick installation of Streams, the default settings target a development environment. For production environment settings, see [Configuration for production environment](#configuration-for-production-environment) section further down.

### Embedded MariaDB settings

By default, an embedded MariaDB database is installed on your K8s cluster next to Streams.

#### Set MariaDB credentials

Passwords are required for Streams microservices to securely connect to an embedded MariaDB. To set your database passwords, you need to create a secret including your passwords, for example:

```sh
export NAMESPACE="my-namespace"
export MARIADB_ROOT_PASSWORD="my-mariadb-root-password"
export MARIADB_PASSWORD="my-mariadb-user-password"
export MARIADB_REPLICATION_PASSWORD="my-mariadb-replication-password"

kubectl create secret generic streams-database-passwords-secret --from-literal=mariadb-root-password=${MARIADB_ROOT_PASSWORD} --from-literal=mariadb-password=${MARIADB_PASSWORD}  --from-literal=mariadb-replication-password=${MARIADB_REPLICATION_PASSWORD} -n ${NAMESPACE}
```

#### Enable MariaDB security

By default, MariaDB is configured with [TLS communication](#tls-communication) and [Transparent Data Encryption](#transparent-data-encryption-tde) enabled. To customize your MariaDB security settings, see [Custom embedded MariaDB security settings](/docs/install/customize-install#custom-embedded-mariadb-security-settings).

##### TLS communication

To configure the TLS communication between MariaDB and Streams microservices, provide a CA certificate, a server certificate, and a server key.

For more information on how to generate a self-signed certificate, see MariaDB documentation - [Certificate Creation with OpenSSL](https://mariadb.com/kb/en/certificate-creation-with-openssl/).

{{< alert title="Note" >}}The server certificate's Common Name must be set up with *streams-database*.{{< /alert >}}

##### Transparent Data Encryption (TDE)

To configure the MariaDB data-at-rest encryption, you must provide a keyfile. The keyfile must contain a 32-bit integer identifier followed by the hex-encoded encryption key separated by semicolon. For example, `<encryption_key_id>`;`<hex-encoded_encryption_key>`.

To generate the keyfile, run the following command:

```sh
echo "1;$(openssl rand -hex 32)" > keyfile
```

##### MariaDB security secret

To enable TLS and TDE on MariaDB, you must create a k8s secret. For example:

 ```sh
export NAMESPACE="my-namespace"
kubectl create secret generic streams-database-secret --from-file=CA_PEM=ca.pem --from-file=SERVER_CERT_PEM=server-cert.pem --from-file=SERVER_KEY_PEM=server-key.pem --from-file=KEYFILE=keyfile -n ${NAMESPACE}
```

#### Performance tuning

You can update the following embedded MariaDB configuration values:

* `wait-timeout` - update by setting the [Helm parameter](/docs/install/helm-parameters-reference/) `embeddedMariadb.waitTimeout`.
* `max-connections` - updated by setting the [Helm parameter](/docs/install/helm-parameters-reference/) `embeddedMariadb.maxConnections`.

For more information, see [database considerations](/docs/architecture#database-considerations).

### Embedded Kafka settings

By default, an embedded Kafka cluster is installed on your K8s cluster next to Streams.

For security reasons, we strongly recommend to enable [SASL authentication](https://docs.confluent.io/current/kafka/authentication_sasl/index.html#authentication-with-sasl) and [TLS encryption](https://docs.confluent.io/current/kafka/encryption.html#encryption-with-ssl) for Kafka clients and brokers. For alternate security settings, see [Custom embedded kafka security settings](/docs/install/customize-install#custom-embedded-kafka-security-settings).

SASL and TLS are enabled by default. Because there is no sensitive data in Zookeeper, the communications with Zookeeper are in plaintext without authentication.

To configure SASL authentication, you must create a K8s secret with your kafka credentials, for example:

```sh
export NAMESPACE="my-namespace"
export KAFKA_CLIENT_PASSWORD="my-kakfa-client-password"
export KAFKA_INTERBROKER_PASSWORD="my-kakfa-interbroker-password"

kubectl -n ${NAMESPACE} create secret generic streams-kafka-passwords-secret --from-literal="client-passwords=${KAFKA_CLIENT_PASSWORD}" --from-literal="inter-broker-password=${KAFKA_INTERBROKER_PASSWORD}"
```

To configure TLS encryption, you must have a valid truststore and one certificate per broker. They must all be integrated into Java Key Stores (JKS) files. Note that each broker needs its own keystore and a dedicated CN name matching the Kafka pod hostname, as described in the [bitnami](https://github.com/bitnami/charts/tree/master/bitnami/kafka#enable-security-for-kafka-and-zookeeper) documentation.

To facilitate the TLS configuration, we provide you with a script to help with truststore and keystore generation (based on bitnami's script that properly handles Kubernetes deployment). For example:

```sh
cd tools
./kafka-generate-ssl.sh
```

After you keystore and certificates are created, you must create a secret, which contains all the previously generated files:

```sh
export NAMESPACE="my-namespace"
export KAFKA_SECRET_PASSWORD="my-kakfa-secret-password"
kubectl -n ${NAMESPACE} create secret generic streams-kafka-client-jks-secret --from-file="./truststore/kafka.truststore.jks" --from-file=./keystore/kafka-0.keystore.jks --from-file=./keystore/kafka-1.keystore.jks --from-file=./keystore/kafka-2.keystore.jks --from-literal="jks-password=${KAFKA_SECRET_PASSWORD}"
```

## Configuration for production environment

This section covers recommended steps to install Streams in a production environment.

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

3. Provide the new user with rights to select, insert, update, and delete on Streams database. It is also recommended to force the TLS authentication for this user. You can grant these privileges by running the following:

    ```sh
    export DB_HOST="my-db-host"
    export DB_PORT="my-db-port"
    export DB_USER="my-db-user"
    export DB_NAME="streams"
    export DB_STREAMS_USER="streams"
    
    mysql -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" -p -e "GRANT SELECT, INSERT, UPDATE, DELETE ON ${DB_NAME}.* TO ${DB_STREAMS_USER} REQUIRE SSL;"
    ```

4. Provide the connectivity information to the Streams installation by setting the following [Helm parameters](/docs/install/helm-parameters-reference/#mariadb-parameters):

    * `externalizedMariadb.host`
    * `externalizedMariadb.port`
    * `externalizedMariadb.rootUsername`

5. Set the [Helm parameter](/docs/install/helm-parameters-reference/#streams-parameters) `streams.serviceArgs.spring.datasource.hikari.maxLifetime` to a value (in seconds) according to the `wait-timeout` value of your MariaDB database. For more information, see [Database considerations](/docs/architecture#database-considerations).

#### Set external MariaDB credentials

Passwords are required for Streams microservices to securely connect to an embedded MariaDB. To set your database passwords, you need to create a secret including your passwords, for example:

```sh
export NAMESPACE="my-namespace"
export MARIADB_ROOT_PASSWORD="my-mariadb-root-password"
export MARIADB_PASSWORD="my-mariadb-user-password"

kubectl create secret generic streams-database-passwords-secret --from-literal=mariadb-root-password=${MARIADB_ROOT_PASSWORD} --from-literal=mariadb-password=${MARIADB_PASSWORD} -n ${NAMESPACE}
```

#### Externalized MariaDB TLS

For security reasons, we strongly recommend to enable TLS communication between your database and Streams microservices. The *One-Way TLS* is the most used mode, and it can be enabled as follows:

1. Provide a CA certificate by creating a secret:

    ```sh
    export NAMESPACE="my-namespace"
    kubectl create secret generic streams-database-secret --from-file=CA_PEM=ca.pem -n ${NAMESPACE}
    ```
2. Set the [Helm parameters](/docs/install/helm-parameters-reference/) `externalizedMariadb.tls.twoWay` to `false`.

For more information on how to generate a self-signed certificate, see MariaDB documentation - [Certificate Creation with OpenSSL](https://mariadb.com/kb/en/certificate-creation-with-openssl/).

For alternate security settings, see [Custom externalized MariaDB security settings](/docs/install/customize-install#custom-externalized-mariadb-security-settings).

### Externalized Kafka settings

By default, an embedded Kafka cluster is installed on your K8s cluster next to Streams. For production environments, we recommend that you use an externalized Kafka instead.

To disable the embedded Kafka installation and use a externalized kafka cluster, follow these steps::

1. Set the [Helm parameter](/docs/install/helm-parameters-reference/#kafka-parameters) `embeddedKafka.enabled` to `false`.
2. Provide connectivity information to the Streams installation by specifying the [Helm parameter](/docs/install/helm-parameters-reference/#kafka-parameters) `externalizedKafka.bootstrapServers`.
3. Ensure that `delete.topic.enable` is set to `true` in your [Kafka](https://kafka.apache.org/documentation/#upgrade_100_notable) installation.

#### Externalized Kafka security settings

For security reasons, we strongly recommend to enable [SASL authentication](https://docs.confluent.io/current/kafka/authentication_sasl/index.html#authentication-with-sasl) and [TLS encryption](https://docs.confluent.io/current/kafka/encryption.html#encryption-with-ssl) for Kafka clients and brokers.

To configure SASL authentication, follow these steps:

1. Create a K8s secret with your kafka credentials:

    ```sh
    export NAMESPACE="my-namespace"
    export KAFKA_USER_PASSWORD="my-kafka-password"
    
    kubectl create secret generic streams-kafka-passwords-secret --from-literal=client-passwords=${KAFKA_USER_PASSWORD} -n ${NAMESPACE}
    ```

2. Provide a JKS containing the Kafka TLS truststore and its password:

    ```sh
    export NAMESPACE="my-namespace"
    export KAFKA_JKS_PASSWORD="my-kafka-jks-password"
    export KAFKA_JKS_PATH="my-kafka-jks-path"
    
    kubectl create secret generic streams-kafka-client-jks-secret --from-file=kafka.truststore.jks=${KAFKA_JKS_PATH} --from-literal=jks-password=${KAFKA_JKS_PASSWORD} -n ${NAMESPACE}
    ```

3. Set the [Helm parameter](/docs/install/helm-parameters-reference/#kafka-parameters) `externalizedKafka.auth.clientUsername` with your Kafka username.

To disable security settings, see [Disable externalized kafka security settings](/docs/install/customize-install#disable-externalized-kafka-security-settings).

## Ingress settings

An ingress controller is installed on your K8s cluster next to Streams.

### Load Balancer settings

Depending on your cloud provider, deploying a load balancer might require additional parameters. For example, if you are using AWS, you must define the load balancer by setting the [Helm parameter](/docs/install/helm-parameters-reference/) `nginx-ingress-controller.service.annotations."service.beta.kubernetes.io/aws-load-balancer-type"` to `nlb`.

Refer to your own cloud provider for further details.

For more information on the load balancer types, see [Reference Architecture](/docs/architecture#load-balancer).

### Ingress hostname

You must specify a hostname for the ingress installed with Streams helm chart. To do so, you must set the [Helm parameter](/docs/install/helm-parameters-reference/#ingress-parameters) `ingress.host` parameter to specify the hostname.

Because this is a mandatory setting, if you do not have a hostname yet, use a temporary value and edit it later. In most case a DNS name will be generated after the installation by your cloud provider load balancer.

To update the ingress host, run the following command:

```sh
export NAMESPACE="my-namespace"
kubectl get svc -o=jsonpath='{.items[?(streams-*)].status.loadBalancer.ingress[0].hostname}' -n "${NAMESPACE}"
```

Then upgrade your Streams installation with the [Helm parameter](/docs/install/helm-parameters-reference/#ingress-parameters) `ingress.host` set with the DNS name retrieved previously. For more information, see [Helm upgrade](/docs/install/upgrade/).

{{< alert title="Note" >}} `k8s.yourdomain.tld` is used throughout this documentation as an example hostname value.{{< /alert >}}

### Ingress TLS

SSL/TLS is enabled by default on the embedded Ingress controller with a auto-generated certificate. To use your own controller, see [Custom ingress controller security settings](/docs/install/customize-install#custom-ingress-controller-security-settings).

### Ingress CORS

Cross-Origin Resource Sharing (CORS) is disabled by default. To enable it, see [Custom ingress controller CORS](/docs/install/customize-install#custom-ingress-controller-cors).

## Monitor your installation

Streams ships with traffic monitoring. You can activate metrics with the parameters listed in [Monitoring parameters](/docs/install/helm-parameters-reference/#monitoring-parameters), which will open endpoints designed to be scrapped by [Prometheus](https://prometheus.io).

{{< alert title="Note" >}}Enabling monitoring may increase CPU and memory loads.{{< /alert >}}

## Add self-signed TLS certificates

TLS endpoints which Streams services connect to must have a valid TLS certificate. If your endpoints use self-signed certificates, you must add them to Streams services as trusted certificates as follows:

1. Ensure that your certificates are in PEM format.
2. Create one or several secrets containing your PEM files, for example:

    ```sh
    export NAMESPACE="my-namespace"
    export SECRET_NAME="my-secret"
    export PEM_PATH="my-pem-path"
    
    kubectl create secret generic "${SECRET_NAME}" -n "${NAMESPACE}" --from-file="${PEM_PATH}" [--from-file=<other-pem-path>]
    ```

3. Set the [Helm parameter](/docs/install/helm-parameters-reference/) `streams.extraCertificatesSecrets` to your `$SECRET_NAME`. If you have more than one secrets, they must be separated by a comma.

## Customize your installation

You can specify optional [Helm parameters](/docs/install/helm-parameters-reference/) to customize your installation.

You can also find examples of customization at [Customize installation](/docs/install/customize-install).

## Helm install command

You can deploy Streams in non-HA or HA configurations.

### Non-High availability configuration

The following command deploys Streams components in a non-HA configuration with one replica per microservices. This might take a few minutes.

{{< alert title="Note" >}}This is not recommended for production environments.{{< /alert >}}

```sh
export NAMESPACE="my-namespace"
export HELM_RELEASE_NAME="my-release"

helm install "${HELM_RELEASE_NAME}" . \
  -f values.yaml \
  -n "${NAMESPACE}"
```

### High availability configuration (recommend for production)

The following command deploys Streams on the Kubernetes cluster in High availability. This might take a few minutes.

{{< alert title="Note" >}}This is recommended for production environments.{{< /alert >}}

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

### Run smoke tests to verify Streams configuration

To verify Streams is properly configured, launch the automated smoke tests provided by the Helm Chart. The tests perform the following:

* Test the `Hub` API by creating a topic named `smoke-test-topic` using our public test API `https://stockmarket.streamdata.io/prices` and the `http-poller` publisher.
* Test the `SSE` subscription API by starting a subscription to the topic previously created.

Run the following command to start the smoke tests:

```sh
export NAMESPACE="my-namespace"
export HELM_RELEASE_NAME="my-release"
helm test "${HELM_RELEASE_NAME}" -n "${NAMESPACE}"
```

The following shows the output in case of success:

```sh
NAME: my-namespace
LAST DEPLOYED: Fri Dec  3 12:30:58 2021
NAMESPACE: test
STATUS: deployed
REVISION: 1
TEST SUITE:     my-release-smoke-tests
Last Started:   Fri Dec  3 12:32:32 2021
Last Completed: Fri Dec  3 12:34:04 2021
Phase:          Succeeded
NOTES:
Validate your installation following the documentation (https://streams-open-docs.netlify.app/docs/install/#validate-the-installation).
```

In case of failure (`Phase : Failed`), check the logs of the `smoke-tests` pod as follows:

```sh
export NAMESPACE="my-namespace"
export HELM_RELEASE_NAME="my-release"
kubectl logs "pod/${HELM_RELEASE_NAME}-smoke-tests" -n "${NAMESPACE}"
```

Finally, verify the `SSE` subscription API is accessible through the Load Balancer provided during installation. Run the following command to start the subscription:

```sh
export NAMESPACE="my-namespace"
INGRESS_ADDRESS=$(kubectl get ingress -o=jsonpath='{.items[?(@.metadata.name=="streams-subscriber-sse")].status.loadBalancer.ingress[0].hostname}' -n ${NAMESPACE}) | echo ${INGRESS_ADDRESS}
curl -v "https://${INGRESS_ADDRESS}/streams/subscribers/sse/api/v1/topics/smoke-test-topic"
```

{{< alert title="Note" >}}
The default configuration only accepts incoming HTTP/HTTPS requests to `k8s.yourdomain.tld`. For more information, see [Helm parameters](/docs/install/helm-parameters-reference/).
{{< /alert >}}
