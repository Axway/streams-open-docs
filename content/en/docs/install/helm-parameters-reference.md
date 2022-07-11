---
title: Helm parameters reference
linkTitle: Helm parameters reference
weight: 20
date: 2021-02-18
description: Use the following parameters to edit your Streams configuration.
---

Description of the Helm parameters that you can change to customize your Streams configuration.

## MariaDB parameters

| Parameter                             | Description                         | Mandatory | Default value |
| ------------------------------------- | ----------------------------------- | --------- | ------------- |
| `embeddedMariadb.enabled`               | MariaDB installed in K8s with the Helm chart. If set to false, the `externalizedMariadb` parameter will be used | no | true |
| `embeddedMariadb.tls.enabled`           | MariaDB TLS enabled                 | no        | true          |
| `embeddedMariadb.encryption.enabled`    | MariaDB Transparent Data Encryption enabled | no | true         |
| `embeddedMariadb.metrics.enabled`       | Activate metrics endpoint for MariaDB | no      | false         |
| `embeddedMariadb.maxConnections`        | Maximum number of parallel client connections to MariaDB | no | 500 |
| `embeddedMariadb.waitTimeout`           | Time in seconds that MariaDB waits for activity on a connection before closing it | no | 300 |
| `externalizedMariadb.host`              | Host of the externalized MariaDB (Only used when `embeddedMariadb.enabled` set to false) | no | my.db.host |
| `externalizedMariadb.port`              | Port of the externalized MariaDB (Only used when `embeddedMariadb.enabled` set to false) | no | 3306 |
| `externalizedMariadb.db.name`         | Name of the MySQL database used for Streams (Only used when `embeddedMariadb.enabled` set to false) | no | streams |
| `externalizedMariadb.db.user`           | Username of the externalized MariaDB used by Streams (Only used when `embeddedMariadb.enabled` set to false) | no | streams |
| `externalizedMariadb.rootUsername`      | Root username of the externalized MariaDB used by Streams (Only used when `embeddedMariadb.enabled` set to false) | no | root |
| `externalizedMariadb.tls.enabled`      | Externalized MariaDB TLS enabled (Only used when `embeddedMariadb.enabled` set to false) | no | true |
| `externalizedMariadb.tls.twoWay`        | Externalized MariaDB Two-Way TLS enabled (only used when `embeddedMariadb.enabled` set to false) | no | true |

## Kafka parameters

| Parameter                               | Description                         | Mandatory | Default value |
| --------------------------------------- | ----------------------------------- | --------- | ------------- |
| `embeddedKafka.enabled`                   | Kafka installed in K8s with the Helm chart. If set to false, the `externalizedKafka` parameter will be used | no | true |
| `embeddedKafka.auth.clientProtocol`       | Authentication protocol used by Kafka client (must be "sasl_tls" or "plaintext") | no | sasl_tls |
| `embeddedKafka.auth.interBrokerProtocol`  | Authentication protocol internally used by Kafka broker (must be "sasl_tls" or "plaintext") | no | sasl_tls |
| `embeddedKafka.metrics.jmx.enabled`       | Activate metrics endpoint for Kafka | no        | false         |
| `externalizedKafka.bootstrapServers`  | List of externalized Kafka bootstrap servers used by Streams (only used when `embeddedKafka.enabled` set to false) | no | my.broker.1:port,my.broker.2:port |
| `externalizedKafka.auth.clientUsername`   | Username of the externalized Kafka used by Streams. Only used when `embeddedKafka.enabled` is set to false) | no | streams |
| `externalizedKafka.auth.clientProtocol`   | Authentication protocol used by Kafka client (must be "sasl_tls" or "plaintext". Only used when `embeddedKafka.enabled` is set to false)) | no | sasl_tls |

## Zookeeper parameters

| Parameter                             | Description                         | Mandatory | Default value |
| ------------------------------------- | ----------------------------------- | --------- | ------------- |
| `zookeeper.metrics.enabled`             | Activate metrics endpoint for Zookeeper | no    | false         |

## Ingress parameters

| Parameter                             | Description                         | Mandatory | Default value |
| ------------------------------------- | ----------------------------------- | --------- | ------------- |
| `nginx-ingress-controller.enabled`      | Enable/Disable NGINX                | no        | true          |
| `ingress.host` | Domain name used for incoming HTTP requests if `nginx-ingress-controller.enabled` is set to true | yes | N/A |
| `ingress.tlsenabled`                    | Enable embedded ingress SSL/TLS     | no        | true          |
| `ingress.tlsSecretName`                 | Embedded ingress SSL/TLS certificate secret name | no | streams-ingress-tls-secret |
| `ingress.annotations."nginx.ingress.kubernetes.io/enable-cors"` | Enable cross origin requests | no | false |
| `ingress.annotations."nginx.ingress.kubernetes.io/cors-allow-origin"` | Allow cross origin requests for the given domains | no | N/A |
| `nginx-ingress-controller.service.annotations."service.beta.kubernetes.io/aws-load-balancer-type"` | Request a loadbalancer on AWS. For example, with the "nlb" value) | no | N/A |
| `nginx-ingress-controller.metrics.enabled` | Activate metrics endpoint for Ingress controller | no | false |

{{< alert title="Note" >}}
Annotations parameters require double quotation marks. Meaning that in a Helm values file, `ingress.annotations."nginx.ingress.kubernetes.io/cors-allow-origin"` turns into

```yaml
ingress:
  annotations:
    "nginx.ingress.kubernetes.io/cors-allow-origin": true
```

If you are setting those parameters through `--set` on the command line, you must escape the dots between the double quotation marks.
{{< /alert >}}

## Streams parameters

| Parameter                                                  | Description                                                                                | Mandatory | Default value                                                |
|------------------------------------------------------------|--------------------------------------------------------------------------------------------|-----------|--------------------------------------------------------------|
| `acceptGeneralConditions`                                  | Accept General Conditions                                                                  | yes       | N/A                                                          |
| `images.repository`                                        | Streams Images repository                                                                  | yes       | docker.repository.axway.com/axwaystreams-docker-prod-ptx/2.0 |
| `imagePullSecrets[0].name`                                 | Image registry keys                                                                        | no        | streams-docker-registry-secret                               |
| `hub.replicaCount`                                         | Hub replica count                                                                          | no        | 1 (2 HA)                                                     |
| `hub.service.port`                                         | HTTP port to reach the Streams Topics API                                                  | no        | 8080                                                         |
| `subscriberSse.enabled`                                    | Enable/Disable Subscriber SSE                                                              | no        | true                                                         |
| `subscriberSse.replicaCount`                               | Subscriber SSE replica count                                                               | no        | 1 (2 HA)                                                     |
| `subscriberSse.service.port`                               | HTTP port to subscribe to a topic                                                          | no        | 8080                                                         |
| `subscriberWebhook.enabled`                                | Enable/Disable Subscriber Webhook                                                          | no        | true                                                         |
| `subscriberWebhook.replicaCount`                           | Subscriber Webhook replica count                                                           | no        | 1 (2 HA)                                                     |
| `subscriberWebhook.service.port`                           | HTTP port to subscribe to a topic                                                          | no        | 8080                                                         |
| `subscriberWebSocket.enabled`                              | Enable/Disable Subscriber WebSocket                                                        | no        | false                                                        |
| `subscriberWebSocket.replicaCount`                         | Subscriber WebSocket replica count                                                         | no        | 1 (2 HA)                                                     |
| `subscriberWebSocket.service.port`                         | HTTP port to subscribe to a topic                                                          | no        | 8080                                                         |
| `subscriberKafka.enabled`                                  | Enable/Disable Subscriber Kafka                                                            | no        | false                                                        |
| `subscriberKafka.replicaCount`                             | Subscriber Kafka replica count                                                             | no        | 1 (2 HA)                                                     |
| `subscriberKafka.service.port`                             | HTTP port to subscribe to a topic                                                          | no        | 8080                                                         |
| `publisherHttpPoller.enabled`                              | Enable/Disable Publisher HTTP Poller                                                       | no        | true                                                         |
| `publisherHttpPoller.replicaCount`                         | Publisher HTTP Poller replica count                                                        | no        | 1 (2 HA)                                                     |
| `publisherHttpPost.enabled`                                | Enable/Disable Publisher HTTP Post                                                         | no        | true                                                         |
| `publisherHttpPost.replicaCount`                           | Publisher HTTP Post replica count                                                          | no        | 1 (2 HA)                                                     |
| `publisherHttpPost.service.port`                           | HTTP port to publish to a topic                                                            | no        | 8080                                                         |
| `publisherKafka.enabled`                                   | Enable/Disable Publisher Kafka                                                             | no        | false                                                        |
| `publisherKafka.replicaCount`                              | Publisher Kafka replica count                                                              | no        | 1 (2 HA)                                                     |
| `publisherSfdc.enabled`                                    | Enable/Disable Publisher SFDC                                                              | no        | false                                                        |
| `publisherSfdc.replicaCount`                               | Publisher SFDC replica count                                                               | no        | 1 (2 HA)                                                     |
| `streams.extraCertificatesSecrets`                         | List of secrets containing TLS certs to add as trusted by Streams                          | no        | []                                                           |
| `actuator.prometheus.enabled`                              | Activate metrics endpoints for Streams services                                            | no        | false                                                        |
| `streams.serviceArgs.spring.datasource.hikari.maxLifetime` | Maximum lifetime in milliseconds for a Streams database connection                         | no        | 280000                                                       |
| `discoveryAgent.enabled`                                   | Activate integration with Amplify Central                                                  | yes       | false                                                        |
| `discoveryAgent.apigateway.baseURL`                        | The base URL of the deployed Axway APIGateway                                              | yes       | N/A                                                          |
| `discoveryAgent.apimanager.host`                           | The APIManager host                                                                        | yes       | N/A                                                          |
| `discoveryAgent.apimanager.port`                           | The APIManager port                                                                        | no        | 8075                                                         |
| `discoveryAgent.apimanager.auth.username`                  | Link to the Secret provisioned on Central                                                  | no        | @Secret.streams-apimanager-secret.authUsername               |
| `discoveryAgent.apimanager.auth.password`                  | Link to the Secret provisioned on Central                                                  | no        | @Secret.streams-apimanager-secret.authPassword               |
| `discoveryAgent.apimanager.streamsJWTTokenAPIFrontendName` | The front-end name of the Streams JWT token API provisioned on the API Manager               | no        | Streams Subscribers SSE Auth                                 |
| `discoveryAgent.apimanager.streamsJWTTokenAPISecurityType` | The security type configured for the Streams JWT token API provisioned on the API Manager   | no        | api-key                                                      |
| `discoveryAgent.subscriberSSE.publicBaseURL`               | The public URL of the Streams subscriber SSE API                                           | yes       | N/A                                                          |
| `traceabilityAgent.enabled`                                | Activate traceability with Amplify Central                                                  | yes       | false                                                        |
| `traceabilityAgent.ingestion.host`                         | Traceability ingestion host                                                                | yes       | ingestion.datasearch.axway.com:5044                                                       |
| `traceabilityAgent.ingestion.usageReporting.url`           | Traceability usage reporting URL                                                            | yes       | [https://lighthouse.admin.axway.com](https://lighthouse.admin.axway.com)                                                       |
| `central.organizationID`                                   | Your Amplify Central organization ID                                                       | no        | N/A                                                          |
| `central.environment`                                      | Your Amplify Central environment, as shown in topology                                      | no        | N/A                                                          |
| `central.url`                                              | Amplify Central URL                                                                        | no        | [https://apicentral.axway.com](https://apicentral.axway.com) |
| `central.auth.clientID`                                    | Client ID in the service account associated with your key pair                             | no        | N/A                                                          |
| `central.auth.url`                                         | Amplify Central authentication URL                                                         | no        | [https://login.axway.com/auth](https://login.axway.com/auth) |

## Monitoring parameters

| Parameter                                   | Description                                      | Mandatory | Default value |
|---------------------------------------------|--------------------------------------------------|-----------|---------------|
| `embeddedMariadb.metrics.enabled`           | Activate metrics endpoint for MariaDB            | no        | false         |
| `zookeeper.metrics.enabled`                 | Activate metrics endpoint for Zookeeper          | no        | false         |
| `embeddedKafka.metrics.jmx.enabled`         | Activate metrics endpoint for Kafka              | no        | false         |
| `nginx-ingress-controller.metrics.enabled`  | Activate metrics endpoint for Ingress controller | no        | false         |
| `actuator.prometheus.enabled`               | Activate metrics endpoints for Streams services  | no        | false         |

## Configure parameters from a dependency chart

To configure a parameter from a dependency chart, for example, [MariaDB](https://github.com/bitnami/charts/tree/master/bitnami/mariadb), [Kafka](https://github.com/bitnami/charts/tree/master/bitnami/kafka), [Zookeeper](https://github.com/bitnami/charts/tree/master/bitnami/zookeeper), or [Nginx](https://github.com/bitnami/charts/tree/master/bitnami/nginx-ingress-controller), you must add the chart prefix name to the command line argument. For example:

```
--set embeddedMariadb.image.tag=latest --set embeddedKafka.replicaCount=2
```
