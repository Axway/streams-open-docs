---
title: Helm parameters
linkTitle: Helm parameters
weight: 1
date: 2021-02-18
description: Use the following parameters to edit your configuration.
---

## Docker registry parameters

| Parameter                             | Description                         | Mandatory | Default value |
| ------------------------------------- | ----------------------------------- | --------- | ------------- |
| imagePullSecrets[0].name              | Image registry keys                 | no        |               |

## MariaDB parameters

| Parameter                             | Description                         | Mandatory | Default value |
| ------------------------------------- | ----------------------------------- | --------- | ------------- |
| embeddedMariadb.enabled               | MariaDB installed in K8s with the Helm chart. If set to false, the `externalizedMariadb` parameter will be used | no | true |
| embeddedMariadb.tls.enabled           | MariaDB TLS enabled                 | no        | true          |
| embeddedMariadb.encryption.enabled    | MariaDB Transparent Data Encryption enabled | no | true         |
| embeddedMariadb.metrics.enabled       | Activate metrics endpoint for MariaDB | no      | false         |
| embeddedMariadb.maxConnections        | Maximum number of parallel client connections to MariaDB | no | 500 |
| embeddedMariadb.waitTimeout           | Time in seconds that MariaDB waits for activity on a connection before closing it | no | 300 |
| externalizedMariadb.host              | Host of the externalized MariaDB (Only used when `embeddedMariadb.enabled` set to false) | no | my.db.host |
| externalizedMariadb.port              | Port of the externalized MariaDB (Only used when `embeddedMariadb.enabled` set to false) | no | 3306 |
| externalizedMariadb.db.name           | Name of the MySQL database used for Streams (Only used when `embeddedMariadb.enabled` set to false) | no | streams |
| externalizedMariadb.db.user           | Username of the externalized MariaDB used by Streams (Only used when `embeddedMariadb.enabled` set to false) | no | streams |
| externalizedMariadb.rootUsername      | Root username of the externalized MariaDB used by Streams (Only used when `embeddedMariadb.enabled` set to false) | no | root |
| externalizedMariadb.tls.enabled       | Externalized MariaDB tls enabled (Only used when `embeddedMariadb.enabled` set to false) | no | true |
| externalizedMariadb.tls.twoWay        | Externalized MariaDB Two-Way tls enabled (only used when `embeddedMariadb.enabled` set to false) | no | true |

## Kafka parameters

| Parameter                               | Description                         | Mandatory | Default value |
| --------------------------------------- | ----------------------------------- | --------- | ------------- |
| embeddedKafka.enabled                   | Kafka installed in K8s with the Helm chart. If set to false, the `externalizedKafka` parameter will be used | no | true |
| embeddedKafka.auth.clientProtocol       | Authentication protocol used by Kafka client (must be "sasl_tls" or "plaintext") | no | sasl_tls |
| embeddedKafka.auth.interBrokerProtocol  | Authentication protocol internaly used by Kafka broker (must be "sasl_tls" or "plaintext") | no | sasl_tls |
| embeddedKafka.metrics.jmx.enabled       | Activate metrics endpoint for Kafka | no        | false         |
| externalizedKafka.auth.clientUsername   | Username of the externalized Kafka used by Streams (only used when `embeddedKafka.enabled` set to false) | no | streams |
| externalizedKafka.auth.clientProtocol   | Authentication protocol used by Kafka client (must be "sasl_tls" or "plaintext" ; only used when `embeddedKafka.enabled` set to false)) | no | sasl_tls |

## Zookeeper parameters

| Parameter                             | Description                         | Mandatory | Default value |
| ------------------------------------- | ----------------------------------- | --------- | ------------- |
| zookeeper.metrics.enabled             | Activate metrics endpoint for Zookeeper | no    | false         |

## Ingress parameters

| Parameter                             | Description                         | Mandatory | Default value |
| ------------------------------------- | ----------------------------------- | --------- | ------------- |
| ingress-nginx.enabled                 | Enable/Disable NGINX                | no        | true          |
| ingress.host | Domain name used for incoming HTTP requests if `ingress-nginx.enabled` is set to true | yes | none |
| ingress.tlsenabled                    | Enable embedded ingress SSL/TLS     | no        | true          |
| ingress.tlsSecretName                 | Embedded ingress SSL/TLS certificate secret name | no | streams-ingress-tls-secret |
| ingress-nginx.controller.metrics.enabled | Activate metrics endpoint for Ingress controller | no | false |

## Streams parameters

| Parameter                             | Description                         | Mandatory | Default value |
| ------------------------------------- | ----------------------------------- | --------- | ------------- |
| images.repository                     | Streams Images repository           | yes       | axway         |
| imagePullSecrets[0].name              | Image registry keys                 | no        |               |
| hub.replicaCount                      | Hub replica count                   | no        | 2             |
| hub.service.port                | Http port to reach the Streams Topics API | no        | 8080          |
| subscriberWebhook.replicaCount        | Subscriber Webhook replica count    | no        | 2             |
| subscriberWebhook.service.port | Http port to subscribe to a topic          | no        | 8080          |
| publisherHttpPoller.replicaCount      | Publisher HTTP Poller replica count | no        | 2             |
| publisherHttpPost.enabled             | Enable/Disable Publisher HTTP Post  | no        | true          |
| publisherHttpPost.replicaCount        | Publisher HTTP Post replica count   | no        | 2             |
| publisherHttpPost.service.port | Http port to publish to a topic     | no        | 8080          |
| publisherKafka.enabled                | Enable/Disable Publisher Kafka      | no        | true          |
| publisherKafka.replicaCount           | Publisher Kafka replica count       | no        | 2             |
| publisherSfdc.enabled                 | Enable/Disable Publisher SFDC       | no        | false         |
| publisherSfdc.replicaCount            | Publisher SFDC replica count        | no        | 2             |
| streams.extraCertificatesSecrets      | List of secrets containing TLS certs to add as trusted by Streams | no | [] |
| actuator.prometheus.enabled           | Activate metrics endpoints for Streams services | no | false    |
| streams.serviceArgs.spring.datasource.hikari.maxLifetime | Maximum lifetime in milliseconds for a Streams database connection | no | 280000 |

## Monitoring parameters

| Parameter                             | Description                         | Mandatory | Default value |
| ------------------------------------- | ----------------------------------- | --------- | ------------- |
| embeddedMariadb.metrics.enabled       | Activate metrics endpoint for MariaDB | no      | false         |
| zookeeper.metrics.enabled             | Activate metrics endpoint for Zookeeper | no    | false         |
| embeddedKafka.metrics.jmx.enabled     | Activate metrics endpoint for Kafka | no        | false         |
| ingress-nginx.controller.metrics.enabled | Activate metrics endpoint for Ingress controller | no | false |
| actuator.prometheus.enabled           | Activate metrics endpoints for Streams services | no | false    |

{{< alert title="Note" >}}
If you want to configure a parameter from a dependency chart ([MariaDB](https://github.com/bitnami/charts/tree/master/bitnami/mariadb), [Kafka](https://github.com/bitnami/charts/tree/master/bitnami/kafka), [Zookeeper](https://github.com/bitnami/charts/tree/master/bitnami/zookeeper) or [Nginx](https://github.com/kubernetes/ingress-nginx)), you must add the chart prefix name to the command line argument. For example:

```
--set embeddedMariadb.image.tag=latest --set embeddedKafka.replicaCount=2 `
```

Please refer to the dependency chart's documentation to get the list of parameters.
{{< /alert >}}
