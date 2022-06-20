---
title: Customize installation settings
linkTitle: Customize installation settings
weight: 10
date: 2021-11-30
description: Learn how to customize your Streams installation.
---

You must use [Helm parameters](/docs/install/helm-parameters-reference/) to customize Streams during its installation. Any customization must be done before you install Helm.

## Options to manage Helm parameters

You can manage your custom [Helm parameters](/docs/install/helm-parameters-reference/) in different ways, and the best way depends on your use case. The following are some options that you can use to customize your installation:

* By way of a custom values file (recommended).
* By setting a key value when running the installation or upgrade commands.
* By editing any value in the values.yaml files.

Our recommendation is that you create a custom values file, for example, `my-values.yaml`, where you can overwrite parameters and pass on the file to the installation or upgrade commands. For example:

```
helm install -f values.yaml -f values-ha.yaml -f my-values.yaml <name> <chart>
```

* The last `values` file in this command overwrites any conflicting parameter.

Another option is to use `--set key=value` when running the installation or upgrade commands. For example:

```
helm install <name> <chart> --set key=value
```

Finally, you can edit the `values.yaml` or `values-ha.yaml` files and change any values you need.

{{< alert title="Note" >}}
After you choose one of the options to customize your installation, we recommend you always use it to avoid issues when you [upgrade the helm chart](/docs/install/upgrade/).
{{< /alert >}}

## Use a custom Docker registry

In some cases, you may want to use your own docker registry to retrieve Streams docker images. For example, when you K8s cluster has limited access to internet.

The following code is an example of how to set up a custom registry:

```sh
export NAMESPACE="my-namespace"
export REGISTRY_SECRET_NAME="my-registry-secret-name"
export REGISTRY_SERVER="my-registry-server"
export REGISTRY_USERNAME="my-registry-username"
export REGISTRY_PASSWORD="my-registry-password"

kubectl create secret docker-registry "${REGISTRY_SECRET_NAME}" --docker-server="${REGISTRY_SERVER}"  --docker-username="${REGISTRY_USERNAME}" --docker-password="${REGISTRY_PASSWORD}" -n "${NAMESPACE}"
```

Then you must set the helm parameters `imagePullSecrets[0].name` and `images.repository` accordingly to your custom registry. For more information, see [Streams parameters](/docs/install/helm-parameters-reference#streams-parameters).

## Custom embedded Mariadb security settings

By default, both TLS and TDE encrypt modes are enabled for the embedded MariaDB server. This section shows how you can disable one or the other, or both.

### Enable TLS only

Follow these steps to enable TSL **only**:

1. Create a secret containing the [TLS](#tls) certificates, for example:

    ```sh
    export NAMESPACE="my-namespace"
    kubectl create secret generic streams-database-secret --from-file=CA_PEM=ca.pem --from-file=SERVER_CERT_PEM=server-cert.pem --from-file=SERVER_KEY_PEM=server-key.pem -n ${NAMESPACE}
    ```

2. Set the [Helm parameter](/docs/install/helm-parameters-reference/#mariadb-parameters) `embeddedMariadb.encryption.enabled` to `false`.

### Enable TDE only

Follow these steps to enable TDE **only**:

1. Create a secret containing the [TDE](#transparent-data-encryption-tde) keyfile, for example:

    ```sh
    export NAMESPACE="my-namespace"
    kubectl create secret generic streams-database-secret --from-file=KEYFILE=keyfile -n ${NAMESPACE}
    ```

2. Set the [Helm parameter](/docs/install/helm-parameters-reference/#mariadb-parameters) `embeddedMariadb.tls.enabled` to `false`.

### Disable all security features

To disable MariaDB encryption **and** TLS, you must set the following [Helm parameters](/docs/install/helm-parameters-reference/#mariadb-parameters):

* `embeddedMariadb.tls.enabled` and `embeddedMariadb.encryption.enabled` to `false`
* `embeddedMariadb.master.extraEnvVarsSecret` and `embeddedMariadb.slave.extraEnvVarsSecret` to `null`

{{< alert title="Note" >}}
Disabling security is not recommended for production environments.
{{< /alert >}}

## Custom embedded kafka security settings

Streams requires you to enable both SASL/SCRAM authentication (using the SHA-512 hash functions) and TLS, or neither of the two.

To disable all security features provided by kafka, you must set the following [Helm parameters](/docs/install/helm-parameters-reference/#kafka-parameters):

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

## Custom externalized Mariadb security settings

Depending on your MariaDB specification, you can enable either [One-Way TLS](https://mariadb.com/kb/en/securing-connections-for-client-and-server/#enabling-one-way-tls-for-mariadb-clients) or [Two-Way TLS](https://mariadb.com/kb/en/securing-connections-for-client-and-server/#enabling-two-way-tls-for-mariadb-clients), or you can disabled all security features.

{{< alert title="Note" >}}Note that some MariaDB providers do not offer the Two-Way method. For example, AWS RDS only supports One-Way TLS.{{< /alert >}}

After ensuring the compatibility with your MariaDB server, choose one of the following options to enable or disable the security features.

### Enable One-Way TLS

Follow these steps to enable One-Way TLS:

1. Provide the CA certificate by creating a secret:

    ```sh
    export NAMESPACE="my-namespace"
    kubectl create secret generic streams-database-secret --from-file=CA_PEM=ca.pem -n ${NAMESPACE}
    ```

2. Set the [Helm parameter](/docs/install/helm-parameters-reference/#mariadb-parameters) `externalizedMariadb.tls.twoWay` to `false`.

### Enable Two-way TLS

To enable Two-Way TLS, you must provide the CA certificate, the server certificate, and the server key by creating a secret:

```sh
export NAMESPACE="my-namespace"
kubectl create secret generic streams-database-secret --from-file=CA_PEM=ca.pem --from-file=SERVER_CERT_PEM=server-cert.pem --from-file=SERVER_KEY_PEM=server-key.pem -n ${NAMESPACE}
```

### Disable TLS

To disable TLS, you must set the [Helm parameter](/docs/install/helm-parameters-reference/#mariadb-parameters) `externalizedMariadb.tls.enabled` to `false`.

{{< alert title="Note" >}}
Disabling security is not recommended for production environments.
{{< /alert >}}

## Disable externalized Kafka security settings

Currently, Streams works only with SASL/SCRAM authentication (using the SHA-512 hash functions) and TLS enabled, or neither of the two.

To disable all security features provided by kafka, you must set the following [Helm parameters](/docs/install/helm-parameters-reference/#kafka-parameters) `externalizedKafka.auth.clientProtocol` to `plaintext`.

{{< alert title="Note" >}}
Disabling security is not recommended for production environments.
{{< /alert >}}

## Custom ingress controller settings

This section describes the customizations available for the embedded ingress controller.

### Custom ingress controller security settings

If you don't provide a certificate, SSL will be enabled with a NGINX embedded fake SSL certificate.

To provide a SSL/TLS certificate for the domain name you are using (either CN or SAN fields should match the `ingress.host` [Helm parameter](/docs/install/helm-parameters-reference/)), run the following command:

```sh
export NAMESPACE="my-namespace"
export INGRESS_TLS_KEY_PATH="my-key-path"
export INGRESS_TLS_CHAIN_PATH="my-chain-path"

kubectl create secret tls streams-ingress-tls-secret --key=${INGRESS_TLS_KEY_PATH} --cert="${INGRESS_TLS_CHAIN_PATH}" -n "${NAMESPACE}"
```

To disable SSL/TLS, you must set the [Helm parameter](/docs/install/helm-parameters-reference/) `ingress.tlsenabled` to `false`.

{{< alert title="Note" >}}
Disabling security is not recommended for production environments.
{{< /alert >}}

### Custom ingress controller CORS

To enable CORS, you must set the [Helm parameter](/docs/install/helm-parameters-reference/) `ingress.annotations."nginx.ingress.kubernetes.io/enable-cors"` to `"true"`. For example, add the following line to the Helm Chart installation command:

```
--set-string "ingress.annotations.nginx\.ingress\.kubernetes\.io/enable-cors"="true"
```

* Ensure to enter `--set-string`
* Ensure to use double quotation marks around the annotations parameter. For more information, see [Ingress Helm parameters](/docs/install/helm-parameters-reference/#ingress-parameters).

Then, you can configure CORS by adding annotations to the `ingress` parameter. For example, you can specify a value to the `cors allow origin` configuration with the `ingress.annotations."nginx.ingress.kubernetes.io/cors-allow-origin"` parameter.

For example, to allow cross origin request from the domain name `https://origin-site.com`, add the following line to the Helm Chart installation command:

```
--set "ingress.annotations.nginx\.ingress\.kubernetes\.io/cors-allow-origin"="https://origin-site.com"
```

For more information, see [Nginx documentation](https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/#enable-cors).

## Activate Subscriber SSE security

To secure SSE subscriptions, you must perform the following steps:

* Provide an existing RSA public/private key pair or create a new one as following

   ```bash
   openssl genrsa -out key.pem 2048
   openssl rsa -in key.pem -outform PEM -pubout -out cert.pem
   ```

* Create a kubernetes secret to store the RSA key pair

   ```bash
   kubectl create secret generic streams-subscriber-sse-jwt-secret --from-file=key=key.pem --from-file=cert=cert.pem -n ${NAMESPACE}
   ```

* Activate SSE subscriber Access Token generation/validation

  To secure SSE subscriptions (disabled by default) add the following `values-secured-subscriber-sse.yaml` file to your Helm install command line. Example:
  ```sh
      helm install "${HELM_RELEASE_NAME}" . \
        -f values.yaml \
        -f values-secured-subscriber-sse.yaml \ 
        -n "${NAMESPACE}"
  ```