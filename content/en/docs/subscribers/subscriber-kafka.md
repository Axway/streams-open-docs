---
title: Kafka Subscriber
linkTitle: Kafka Subscriber
weight: 1
date: 2020-07-10
description: Learn how to configure and use the Streams Kafka Subscriber.
---

Streams Kafka subscriber allows clients to route events published in a Streams topic to an external Kafka topic.

## Create a Kafka subscription

You can create a kafka subscription by making an HTTP post request on the following endpoint:

```
POST /streams/subscribers/kafka/api/v1/topics/{topicID}/subscriptions
```

The body parameter must contain a JSON kafka subscription configuration. For example:

```json
{
    "subscriptionMode": "snapshot-only",
    "bootstrapServers": "my-kafka-cluster:9092",
    "topic": "kafka-topic-to-publish-to",
    "partition": 0,
    "recordKey": "optional-custom-record-key",
    "authorization": {
        "type": "sasl_ssl",
        "sasl": {
          "mechanism": "plain",
          "username": "myusername",
          "password": "mypassword"
        }
    }
}
```

| Configuration Entry | Mandatory | Default value | Description                                                                                                                                                                                  |
|---------------------|-----------|---------------|---------------------------------------------------------------------|
| subscriptionMode | no | Default subscription mode defined in the topic's configuration | For more information, see [subscription modes](/docs/subscribers/#subscription-modes).                                                                                                       |
| bootstrapServers | yes | n/a | List of Kafka servers used to bootstrap connections to Kafka.                                                                                                                                |
| topic | yes | n/a | Kafka topic in which a record must be sent.                                                                                                                                                  |
| partition | no | n/a | Kafka partition to use.                                                                                                                                                                      |
| recordKey | no | topic id | Record key to use for each sent record. If not set, the `topicId` is used.                                                                                                                   |
| authorization | no | n/a | Security configuration for connection to the external kafka broker. For more information, see section [Security configuration with SASL and SSL](#security-configuration-with-sasl-and-ssl). |

After the kafka subscription is successfully created, Streams start sending records to your kafka cluster.

### Security configuration with SASL and SSL

The Kafka subscriber supports connection with external kafka broker configured with Secure sockets layer (SSL) and Simple authentication and security layer (SASL).

{{< alert title="Note" >}}SSL and SASL must be activated simultaneously on the kafka broker. The Kafka subscriber does not support SASL configured without SSL for transport layer{{< /alert >}}

The following table describes the security configuration that could be setup when creating a kafka subscription:

| Configuration Entry | Mandatory | Default value | Description                                                                                                                          |
|---------------------|-----------|---------------|--------------------------------------------------------------------------------------------------------------------------------------|
| type                | yes       | n/a           | Type of security protocol configured for the kafka subscription. Currently only `sasl_ssl` is supported.                              |
| sasl.mechanism      | yes       | n/a           | SASL mechanism used by the subscriber kafka to connect with the external kafka broker. Currently only `plain` mechanism is supported. |
| sasl.username       | yes       | n/a           | Username used by the Kafka subscriber to connect with the external kafka broker.                                                      |
| sasl.password       | yes       | n/a           | Password used by the Kafka subscriber to connect with the external kafka broker.                                                      |

#### Configure a custom SSL root certificate authority

With SSL enabled, Streams needs to trust the root certificate authority that signed your kafka broker certificates. If you are not using one of the generic SSL certificates providers (for example, Digicert, Let's Encrypt, and so on), but a custom root certificate authority instead, you must add it to Streams:

Ensure that the root certificate authority you have is in PEM format. You can list and extract the root CA from a truststore with the following command:

```bash
keytool -list -v -keystore <KAFKA TRUSTORE IN JKS>
...
Your keystore contains 1 entry

Alias name: caroot
Creation date: Apr 22, 2022
Entry type: trustedCertEntry
...

keytool -exportcert -rfc -keystore <KAFKA TRUSTORE IN JKS> -alias <ALIAS NAME OF ROOT CA> -file kafka.truststore.pem
```

In this example, the alias name of the root CA is `caroot`.

For more information on how to add the custom certificate, see [Add self-signed TLS certificates](/docs/install/#add-self-signed-tls-certificates), or ask your operator to perform this task if you are not operating Streams yourself.

### Create status codes

The following are HTTP status codes that can be returned when trying to create a kafka subscription:

| Code | Comment |
|------|---------|
| 201 Created | Indicates that the subscription request is valid and has been created. |
| 400 Bad Request | Indicates that the provided data is invalid. |
| 404 Not found | Indicates that the requested URL does not exist. |

## Stop a kafka subscription

To stop sending records to your kafka cluster, delete the corresponding kafka subscription with the following request:

```
DELETE /streams/subscribers/kafka/api/v1/subscriptions/{subscriptionId}
```

### Delete status codes

The following are HTTP status codes that can be returned when deleting the kafka subscription:

| Code | Comment |
|------|---------|
| 204 No Content | Indicates that the subscription has been successfully deleted.
| 404 Not found | Indicates that the provided identifier does not correspond to an existing kafka subscription.

## Getting a kafka subscription

To get an existing subscription, use the following GET request:

```
GET /streams/subscribers/kafka/api/v1/subscriptions/{subscriptionId}
```

### Get status codes

List of HTTP status codes that can be returned when trying to get a kafka subscription:

| Code | Comment |
|------|---------|
| 200 Ok | Indicates that the subscription requested is valid and has been retrieved. |
| 404 Not found | Indicates that the requested URL or subscription requested does not exist. |

## Testing a Kafka subscription

You can test a Kafka subscription by making an HTTP Post request on the following endpoint:

```
POST /streams/subscribers/kafka/api/v1/subscriptions/{subscriptionId}/test
```

The request body can contain any JSON object and it will be sent as-is to the identified subscription.

### Test status codes

The following HTTP status codes can be returned while testing a Kafka subscription:

| Code | Comment |
|------|---------|
| 202 Accepted | Indicates that the payload has been successfully sent to the subscription. |
| 400 Bad Request | Indicates that the provided data are invalid. |
| 404 Not found | Indicates that the requested URL does not exist. |

## Get kafka subscriptions for a topic

Use the following HTTP Get request on your topic to get existing subscriptions:

```
GET /streams/subscribers/kafka/api/v1/topics/{topicId}/subscriptions
```

For more information on how pagination and sorting work, see [Pagination](/docs/topics-api/#pagination).

The field names allowed for sorting are:

* subscriptionMode
* kafkaBootstrapServers
* kafkaTopic
* kafkaPartition
* kafkaRecordKey

## Kafka record

As soon as the publisher starts to publish data, the kafka subscribers start to receive the message, and they send a record with custom headers and a payload.

### Record headers

| Header name | Description |
|-------------|-------------|
| X-Axway-Streams-Subscription-Id | Unique identifier of the kafka subscription. |
| X-Axway-Streams-Topic-Id | Identifier of the topic to which the subscription belongs. |
| X-Axway-Streams-Event-Id | Identifier of the event. |
| X-Axway-Streams-Event-Type | Type of the payload (snapshot, patch or error). |

#### Record Payload

Refer to [subscription modes](/docs/subscribers/#subscription-modes) and [subscription error](/docs/subscribers/subscribers-errors/) section for more details.
