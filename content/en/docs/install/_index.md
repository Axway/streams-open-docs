---
title: Install Streams
linkTitle: Install Streams
weight: 7
date: 2021-02-18
hide_readingtime: true
description: Learn how to install Streams on-premise or deploy it in your private cloud, configure a helm chart, and validate the installation.
---

## Prerequisites

* Kubernetes 1.18+
* Helm 3.2.0+
* RBAC enabled
* PersistentVolumes and LoadBalancer provisioner supported by the underlying infrastructure
* Resources:
    * Minimal non-HA configuration: `9` CPUs and `10` GB RAM dedicated to the platform.
    * Minimal HA configuration: `34` CPUs and `51` GB RAM dedicated to the platform.

For more information, see [Reference Architecture](/docs/architecture).

## Pre-installation

Once you have been on-boarded on [Amplify Platfrom](https://platform.axway.com) by your Axway contact. You will be able to download our last Helm Chart from `Downloads` section of [Axway Support Portal](https://support.axway.com/en/search/index/type/Downloads/sort/created%7Cdesc/ipp/10/product/596/version/3074).

Please download Steams helm chart corresponding to the `release-version` you wish to install.

```sh
export INSTALL_DIR="MyInstallDirectory"

cd ${INSTALL_DIR}/helm/streams
```

{{< alert title="Note" >}}On Axway Support Portal, you will also find others resources such as Postman Collection, OpenApi or docker-compose files.{{< /alert >}}

## Secrets management

Refer to Kubernetes documentation to create [secrets](https://kubernetes.io/docs/concepts/configuration/secret/).

## Helm parameters management

There are different ways to manage your custom [Helm parameters](/docs/install/helm-parameters/), but the best way depends on your use case. For example, you can:

* Use `--set key=value` when running the `helm install` or `helm upgrade` command.
    * Example: `helm install <name> <chart> --set key=value`.
* Edit `values.yaml` or `values-ha.yaml` files and change any values you need.
* Create a custom values file (for example, `my-values.yaml`) where you can overwrite parameter and pass the file to `helm install` or `helm upgrade` command.
    * Example: `helm install -f values.yaml -f values-ha.yaml -f my-values.yaml <name> <chart>`.
    * The last `values` file in the command line above overwrites any conflicting parameter.

After you choose one of the options, we recommend you always use it to avoid issues when you [upgrade the helm chart](/docs/install/upgrade/).

## General conditions for license and subscription services

Axway products and services are governed exclusively by Axway's [General Terms and Conditions](https://www.axway.com/en/legal/contract-documents). To accept them, set the helm value `acceptGeneralConditions` to `"yes"` and proceed with the installation. Ensure to add the double quotation around the `yes` flag.

## Kubernetes namespace

We recommend you deploy Streams components inside a dedicated namespace. To create a namespace, run the following command:

```sh
export NAMESPACE="my-namespace"
kubectl create namespace "${NAMESPACE}"
```

## Docker registry settings

Docker images must be hosted in a docker registry accessible from your Kubernetes cluster. To securely store registry login credentials, we recommend using Kubernetes [secrets](https://kubernetes.io/docs/concepts/configuration/secret/):  

```sh
export NAMESPACE="my-namespace"
export REGISTRY_SECRET_NAME="my-registry-secret-name"
export REGISTRY_SERVER="my-registry-server"
export REGISTRY_USERNAME="my-registry-username"
export REGISTRY_PASSWORD="my-registry-password"

kubectl create secret docker-registry "${REGISTRY_SECRET_NAME}" --docker-server="${REGISTRY_SERVER}"  --docker-username="${REGISTRY_USERNAME}" --docker-password="${REGISTRY_PASSWORD}" -n "${NAMESPACE}"
```

To use the Amplify Platform as your container registry:

1. Ensure you can see our images with your organization on the [Amplify Repository search page](https://repository.axway.com/catalog?q=streams&artifactType=DockerImage).
2. Ensure you have administrative access to create a service account in your organization
3. Access your organization on the [Amplify platform](https://platform.axway.com/#/org):
   1. click on the `Service Accounts` in left panel. You should see all service accounts already created.
   2. click on the `+ Service Account` button at the top right and fill the mandatory fields:
      1. enter a name for the service account
      2. choose the method `Client Secret`
      3. choose for credentials `Platform-generated secret`
   3. then press `Save` button. Be sure to securely store the generated client secret. It will be required in the next step.
4. Create the docker-registry secret. Override the following values from the command above with:
    * `export REGISTRY_SERVER=repository.axway.com`
    * `export REGISTRY_USERNAME=` with your service account Client ID.
    * `export REGISTRY_PASSWORD=` with your service account Client Secret.
    * then run the command just above this note to create the secret `kubectl create secret docker-registry ...`

5. To use the secret you have just created, set the secret's name in the `imagePullSecrets` array. For example, add `--set imagePullSecrets[0].name="${REGISTRY_SECRET_NAME}"` to the Helm Chart installation command.

To use a custom Docker registry, set `images.repository` accordingly to your custom registry. For more information, see [Streams parameters](/docs/install/helm-parameters#streams-parameters).

## MariaDB settings

By default, an embedded MariaDB database is installed on your K8s cluster next to Streams. For production, we recommend that you use an externalized database instead.

To disable MariaDB installation, set `embeddedMariadb.enabled` to `false`. Then, choose one of the options to configure your [externalized MariaDB](#externalized-mariadb-configuration) or [embedded MariaDB](#embedded-mariadb-configuration).

### Externalized MariaDB configuration

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

3. The user should have rights to select, insert, update, and delete on Streams database at a minimum. It is also recommended to force the TLS authentication for this user (`REQUIRE SSL`). You can grant these privileges by running the following:

    ```sh
    export DB_HOST="my-db-host"
    export DB_PORT="my-db-port"
    export DB_USER="my-db-user"
    export DB_NAME="streams"
    export DB_STREAMS_USER="streams"
    
    mysql -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" -p -e "GRANT SELECT, INSERT, UPDATE, DELETE ON ${DB_NAME}.* TO ${DB_STREAMS_USER} REQUIRE SSL;"
    ```

4. Provide information to the Streams installation. Set the following parameters:

    * `externalizedMariadb.host`
    * `externalizedMariadb.port`
    * `externalizedMariadb.rootUsername`

5. Set the [Helm parameter](/docs/install/helm-parameters/) `streams.serviceArgs.spring.datasource.hikari.maxLifetime` to a value (in seconds) accordingly to the `wait-timeout` value of your MariaDB database. For more information, see [Database considerations](/docs/architecture#database-considerations).

#### Externalized MariaDB passwords

Passwords are required for Streams microservices to securely connect to Mariadb.

The following is an example of how to set your database passwords:

```sh
export NAMESPACE="my-namespace"
export MARIADB_ROOT_PASSWORD="my-mariadb-root-password"
export MARIADB_PASSWORD="my-mariadb-user-password"

kubectl create secret generic streams-database-passwords-secret --from-literal=mariadb-root-password=${MARIADB_ROOT_PASSWORD} --from-literal=mariadb-password=${MARIADB_PASSWORD} -n ${NAMESPACE}
```

#### Externalized MariaDB TLS

For security purposes, it is highly recommended to enable TLS communication between your database and Streams microservices. You can enable [One-Way TLS](https://mariadb.com/kb/en/securing-connections-for-client-and-server/#enabling-one-way-tls-for-mariadb-clients) or [Two-Way TLS](https://mariadb.com/kb/en/securing-connections-for-client-and-server/#enabling-two-way-tls-for-mariadb-clients).

{{< alert title="Note" >}} If you use a provider for your MariaDB database, ensure the Two-Way method is available, for example, that it is not available with AWS RDS.{{< /alert >}}

You can choose one of the following options:

* One-Way TLS:
    * Provide the CA certificate by creating a secret:
    ```sh
    export NAMESPACE="my-namespace"
    kubectl create secret generic streams-database-secret --from-file=CA_PEM=ca.pem -n ${NAMESPACE}
    ```
    * Set the [Helm parameters](/docs/install/helm-parameters/) `externalizedMariadb.tls.twoWay` to `false`.

* Two-way TLS:
    * Provide the CA certificate, the server certificate, and the server key by creating a secret:
    ```sh
    export NAMESPACE="my-namespace"
    kubectl create secret generic streams-database-secret --from-file=CA_PEM=ca.pem --from-file=SERVER_CERT_PEM=server-cert.pem --from-file=SERVER_KEY_PEM=server-key.pem -n ${NAMESPACE}
    ```

* No TLS:
    * Set the [Helm parameters](/docs/install/helm-parameters/) `externalizedMariadb.tls.enabled` to `false`.

For more information, see the official documentation provided by MariaDB, [Certificate Creation with OpenSSL](https://mariadb.com/kb/en/certificate-creation-with-openssl/), to generate self-signed certificates. Make sure to set the `Common Name` correctly.

### Embedded MariaDB configuration

Passwords are required for Streams microservices to securely connect to an embedded Mariadb.

The following is an example of how to set your database passwords:

```sh
export NAMESPACE="my-namespace"
export MARIADB_ROOT_PASSWORD="my-mariadb-root-password"
export MARIADB_PASSWORD="my-mariadb-user-password"
export MARIADB_REPLICATION_PASSWORD="my-mariadb-replication-password"

kubectl create secret generic streams-database-passwords-secret --from-literal=mariadb-root-password=${MARIADB_ROOT_PASSWORD} --from-literal=mariadb-password=${MARIADB_PASSWORD}  --from-literal=mariadb-replication-password=${MARIADB_REPLICATION_PASSWORD} -n ${NAMESPACE}
```

#### Embedded MariaDB security

By default, MariaDB is configured with [TLS communication](#tls) and [Transparent Data Encryption](#transparent-data-encryption-tde) enabled.

##### TLS

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

##### MariaDB security configuration

This section describes the options to configures security on your database.

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
    * Set the [Helm parameters](/docs/install/helm-parameters/) `embeddedMariadb.encryption.enabled` to `false`.

* For TDE only:
    * Create a secret containing the [TDE](#transparent-data-encryption-tde) keyfile:
    ```sh
    export NAMESPACE="my-namespace"
    kubectl create secret generic streams-database-secret --from-file=KEYFILE=keyfile -n ${NAMESPACE}
    ```
    * Set the [Helm parameters](/docs/install/helm-parameters/) `embeddedMariadb.tls.enabled` to `false`.

##### Disable MariaDB security features

To disable MariaDB encryption **and** TLS, you must set the following [Helm parameters](/docs/install/helm-parameters/):

* `embeddedMariadb.tls.enabled` and `embeddedMariadb.encryption.enabled` to `false`
* `embeddedMariadb.master.extraEnvVarsSecret` and `embeddedMariadb.slave.extraEnvVarsSecret` to `null`

{{< alert title="Note" >}}
This option is not recommended for production environments.
{{< /alert >}}

#### Embedded MariaDB tuning

The following embedded MariaDB configuration values can be updated:

* `wait-timeout` - update by setting the [Helm parameters](/docs/install/helm-parameters/) `embeddedMariadb.waitTimeout`.

* `max-connections` - updated by setting the [Helm parameters](/docs/install/helm-parameters/) `embeddedMariadb.maxConnections`.

For more information, see [database considerations](/docs/architecture#database-considerations).

## Kafka settings

By default, an embedded Kafka cluster is installed on your K8s cluster next to Streams. For production environments, we recommend that you use an externalized Kafka instead.

To disable the Kafka installation, set `embeddedKafka.enabled` to `false` in the Helm Chart installation command. Then, accordingly to your choice, configure your [externalized Kafka](#externalized-kafka-configuration) or your [embedded Kafka](#embedded-kafka-configuration).

### Externalized Kafka configuration

You must provide information to the Streams installation by specifying `externalizedKafka.bootstrapServers` in the Helm Chart installation command. For example (note that you must escape the comma):

```
--set externalizedKafka.bootstrapServers="my.kafka.broker.1:port\,my.broker.2:port[...]"
```

#### Externalized Kafka security settings

For security purposes, it is highly recommended to enable [SASL authentication](https://docs.confluent.io/current/kafka/authentication_sasl/index.html#authentication-with-sasl) and [TLS encryption](https://docs.confluent.io/current/kafka/encryption.html#encryption-with-ssl) for Kafka clients and brokers, but you can enable both or neither.

{{< alert title="Note" >}}
Currently, Streams works only with **both** SASL/SCRAM authentication (using the SHA-512 hash functions) and TLS enabled, or neither of the two.
{{< /alert >}}

You can choose one of the following options:

* SCRAM and TLS enabled:
    * Provide the user password using a k8s secret:
    ```sh
    export NAMESPACE="my-namespace"
    export KAFKA_USER_PASSWORD="my-kafka-password"

    kubectl create secret generic streams-kafka-passwords-secret --from-literal=client-passwords=${KAFKA_USER_PASSWORD} -n ${NAMESPACE}
    ```
    * Provide a JKS containing the Kafka TLS truststore and its password:

    ```sh
    export NAMESPACE="my-namespace"
    export KAFKA_JKS_PASSWORD="my-kafka-jks-password"
    export KAFKA_JKS_PATH="my-kafka-jks-path"

    kubectl create secret generic streams-kafka-client-jks-secret --from-file=kafka.truststore.jks=${KAFKA_JKS_PATH} --from-literal=jks-password=${KAFKA_JKS_PASSWORD} -n ${NAMESPACE}
    ```

    * Set the [Helm parameters](/docs/install/helm-parameters/) `externalizedKafka.auth.clientUsername` with your Kafka username.

* Security disabled:
    * Set the [Helm parameters](/docs/install/helm-parameters/) `externalizedKafka.auth.clientProtocol` to `plaintext`.

#### Externalized Kafka topics settings

Ensure that `delete.topic.enable` is set to `true` in your [Kafka](https://kafka.apache.org/documentation/#upgrade_100_notable) installation.

### Embedded Kafka configuration

Embedded Kafka does not require specific configuration, it is enabled by default.

#### Embedded Kafka security settings

For security purposes, it is highly recommended to enable [SASL authentication](https://docs.confluent.io/current/kafka/authentication_sasl/index.html#authentication-with-sasl) and [TLS encryption](https://docs.confluent.io/current/kafka/encryption.html#encryption-with-ssl) for Kafka clients and brokers. You can enable both or neither.

SASL and TLS are enabled by default. As there is no sensitive data in Zookeeper, the communications with Zookeeper are in plaintext without authentication.

{{< alert title="Note" >}}
Currently, Streams works only with SASL/SCRAM authentication (using the SHA-512 hash functions) **and** TLS enabled or neither of the two.
{{< /alert >}}

You can choose one of the following options:

* SCRAM and TLS enabled:
    * Provide Kafka credentials using a k8s secret:

    ```sh
    export NAMESPACE="my-namespace"
    export KAFKA_CLIENT_PASSWORD="my-kakfa-client-password"
    export KAFKA_INTERBROKER_PASSWORD="my-kakfa-interbroker-password"

    kubectl -n ${NAMESPACE} create secret generic streams-kafka-passwords-secret --from-literal="client-passwords=${KAFKA_CLIENT_PASSWORD}" --from-literal="inter-broker-password=${KAFKA_INTERBROKER_PASSWORD}"
    ```

    * To configure TLS encryption, you must have a valid truststore and one certificate per broker.
        * They must all be integrated into Java Key Stores (JKS) files. Be careful, as each broker needs its own keystore and a dedicated CN name matching the Kafka pod hostname as described in the [bitnami documentation](https://github.com/bitnami/charts/tree/master/bitnami/kafka#enable-security-for-kafka-and-zookeeper).
        * We provide you with a script to help with truststore and keystore generation (based on bitnami's script that properly handles Kubernetes deployment). You can also use your own truststore and privatekey:

        ```sh
        cd tools
        ./kafka-generate-ssl.sh
        ```

        * Create a secret, which contains all the previously generated files:

        ```sh
        export NAMESPACE="my-namespace"
        export KAFKA_SECRET_PASSWORD="my-kakfa-secret-password"
        kubectl -n ${NAMESPACE} create secret generic streams-kafka-client-jks-secret --from-file="./truststore/kafka.truststore.jks" --from-file=./keystore/kafka-0.keystore.jks --from-file=./keystore/kafka-1.keystore.jks --from-file=./keystore/kafka-2.keystore.jks --from-literal="jks-password=${KAFKA_SECRET_PASSWORD}"
        ```

* Security disabled:
    * Set the following [Helm parameters](/docs/install/helm-parameters/):
        * `embeddedKafka.auth.clientProtocol` to `plaintext`
        * `embeddedKafka.auth.interBrokerProtocol` to `plaintext`
        * `embeddedKafka.auth.sasl.mechanisms` to `plain`
        * `embeddedKafka.auth.sasl.interBrokerMechanism` to `plain`
        * `embeddedKafka.auth.sasl.jaas.clientPasswordSecret` to `null`
        * `embeddedKafka.extraEnvVars` to `null`
        * `embeddedKafka.extraVolumes` to `null`
        * `embeddedKafka.extraVolumeMounts` to `null`

{{< alert title="Note" >}}
Disabling security is not recommended for production environments.
{{< /alert >}}

## Ingress settings

Depending on your Cloud provider, deploying a load balancer might require additional parameters. Refer to your own Cloud provider for further details.

For example, for AWS, you must define the load balancer by setting the [Helm parameter](/docs/install/helm-parameters/) `nginx-ingress-controller.service.annotations."service.beta.kubernetes.io/aws-load-balancer-type"` to `nlb`.

For example, add the following line to the Helm Chart installation command:

```
--set "nginx-ingress-controller.service.annotations.service\.beta\.kubernetes\.io/aws-load-balancer-type"="nlb"
```

* Ensure to use double quotation around the annotations parameter. For more information, see [Ingress Helm parameters](/docs/install/helm-parameters/#ingress-parameters).
* For more information on the load balancer types, see [Reference Architecture](/docs/architecture#load-balancer).

### Ingress hostname

You must specify a hostname for the ingress installed with Streams helm chart. For example, use `ingress.host` parameter to specify the hostname.

{{< alert title="Note" >}} _k8s.yourdomain.tld_ is used throughout this documentation as an example hostname value.{{< /alert >}}

If you do not have a hostname yet, use a temporary value and edit it later.

It is recommended that for testing purposes you install Streams and use the DNS name generated by your cloud provider load balancer. To retrieve the DNS name:

```sh
export NAMESPACE="my-namespace"
kubectl get ingress -o=jsonpath='{.items[?(@.metadata.name=="streams-hub")].status.loadBalancer.ingress[0].hostname}' -n ${NAMESPACE}
```

Then upgrade your Streams installation with the [Helm parameters](/docs/install/helm-parameters/) `ingress.host` set with the DNS name retrieved previously (Refer to the [Helm upgrade](/docs/install/upgrade/) for further details).

### Ingress TLS

SSL/TLS is enabled by default on the embedded Ingress controller. If you don't provide a certificate, SSL will be enabled with a NGINX embedded fake SSL certificate.
To provide a SSL/TLS certificate for the domain name you are using (either CN or SAN fields should match the `ingress.host` [Helm parameter](/docs/install/helm-parameters/)):

```sh
export NAMESPACE="my-namespace"
export INGRESS_TLS_KEY_PATH="my-key-path"
export INGRESS_TLS_CHAIN_PATH="my-chain-path"

kubectl create secret tls streams-ingress-tls-secret --key=${INGRESS_TLS_KEY_PATH} --cert="${INGRESS_TLS_CHAIN_PATH}" -n "${NAMESPACE}"
```

To disable SSL/TLS (not recommended for production use), see [Helm parameters](/docs/install/helm-parameters/).

### Ingress CORS

Cross-Origin Resource Sharing (CORS) is disabled by default. You can enable it by setting the [Helm parameter](/docs/install/helm-parameters/) `ingress.annotations."nginx.ingress.kubernetes.io/enable-cors"` to `"true"`. For example, add the following line to the Helm Chart installation command:

```
--set-string "ingress.annotations.nginx\.ingress\.kubernetes\.io/enable-cors"="true"
```

* Ensure to enter `--set-string`
* Ensure to use double quotation around the annotations parameter. For more information, see [Ingress Helm parameters](/docs/install/helm-parameters/#ingress-parameters).

Then, you can configure the CORS by adding annotations to the `ingress` parameter. For example, you can specify a value to the `cors allow origin` configuration with the `ingress.annotations."nginx.ingress.kubernetes.io/cors-allow-origin"` parameter. For example, to allow cross origin request from the domain name `https://origin-site.com`, add the following line to the Helm Chart installation command:

```
--set "ingress.annotations.nginx\.ingress\.kubernetes\.io/cors-allow-origin"="https://origin-site.com"
```

For more information, see [Nginx documentation](https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/#enable-cors).

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

* Set the [Helm parameters](/docs/install/helm-parameters/) `streams.extraCertificatesSecrets` to your `$SECRET_NAME`. If you have more than one secrets, they must be separated by a comma.

## Monitor your installation

Streams ships with monitoring. You can activate metrics with the parameters listed in [Monitoring parameters](/docs/install/helm-parameters/#monitoring-parameters), which will open endpoints designed to be scrapped by [Prometheus](https://prometheus.io).

{{< alert title="Note" >}}Enabling monitoring may increase CPU and memory loads.{{< /alert >}}

## Helm install command

You can deploy Streams in non-HA or HA configurations.

### Non-High availability configuration

The following command deploys Streams components in a non-HA configuration with one replica per microservices (not recommended for production use). This might take a few minutes.

```sh
export NAMESPACE="my-namespace"
export HELM_RELEASE_NAME="my-release"

helm install "${HELM_RELEASE_NAME}" . \
  -f values.yaml \
  -n "${NAMESPACE}"
```

### High availability configuration

The following command deploys Streams on the Kubernetes cluster in High availability (recommend for production). This might take a few minutes.

Note that optional [Helm parameters](/docs/install/helm-parameters/) can be specified to customize the installation.

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
The default configuration only accepts incoming HTTP/HTTPS requests to `k8s.yourdomain.tld`. For more information, see [Helm parameters](/docs/install/helm-parameters/).
{{< /alert >}}
