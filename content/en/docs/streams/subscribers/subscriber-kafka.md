---
title: Kafka Subscriber
linkTitle: Kafka Subscriber
weight: 150
date: 2020-07-10T00:00:00.000Z
description: Learn how to configure and use the Streams Kafka Subscriber.
---

## Overview

Streams Kafka subscriber allows clients to subscribe to a topic using an external kafka cluster. All messages published to Streams Topic will be transferred to Kafka cluster and topic configured.

## Creating a Kafka subscription

You can create a kafka subscription by making an HTTP Post request on the following endpoint:

`POST /subscribers/kafka/topics/{topicID}/subscriptions`

The body must contain a JSON kafka subscription configuration as follow:

```json
{
    "subscriptionMode": "snapshot-only|snapshot-patch",
    "bootstrapServers": "my-kafka-cluster:9092",
    "topic": "kafka-topic-to-publish-to",
    "partition": 0,
    "recordKey": "a-optional-custom-record-key"
}
```

| Configuration Entry | Mandatory | Default value | Description |
|---------------------|-----------|---------------|-------------|
| subscriptionMode | no | Default subscription mode defined in the topic's configuration | Refer to [subscription modes](/docs/streams/subscribers/#subscription-modes) section |
| bootstrapServers | yes | n/a | List of Kafka servers used to bootstrap connections to Kafka. |
| topic | yes | n/a | Kafka topic in which record must be sent. |
| partition | no | n/a | Kafka partition to use. |
| recordKey | no | topic id | Record key to use for each sent record. If not set, the topicId will be used. |

Once the kafka subscription is successfully created, Streams will start sending record to your kafka cluster.

### Create status codes

Below the list of HTTP status codes that can be returned when trying to create a kafka subscription:

| Code | Comment |
|------|---------|
| 201 Created | Indicates that the subscription request is valid and has been created. |
| 400 Bad Request | Indicates that the provided data are invalid. |
| 404 Not found | Indicates that the requested URL does not exist. |

## Stopping a kafka subscription

In order to stop sending record to your kafka cluster, simply delete the corresponding kafka subscription with following request:

`DELETE /subscribers/kafka/subscriptions/{subscriptionId}`

### Delete status codes

Below the list of HTTP status codes that can be returned when deleting the kafka subscription

| Code | Comment |
|------|---------|
| 204 No Content | Indicates that the subscription has been successfully deleted.
| 404 Not found | Indicates that the provided identifier does not correspond to an existing kafka subscription.

## Getting a kafka subscription

In order to get an existing subscription, simply do the following GET request:

`GET /subscribers/kafka/subscriptions/{subscriptionId}`

### Get status codes

List of HTTP status codes that can be returned when trying to get a kafka subscription:

| Code | Comment |
|------|---------|
| 200 Ok | Indicates that the subscription requested is valid and has been retrieved. |
| 404 Not found | Indicates that the requested URL or subscription requested does not exist. |

## Getting kafka subscriptions for a topic

In order to get existing subscriptions, simply do the following GET request on your topic:

`GET /subscribers/kafka/topics/{topicId}/subscriptions`

See [pagination](/docs/streams/topics-api/#pagination) to get more information about how pagination and sorting work.

The field names allowed for sorting are :

* subscriptionMode
* kafkaBootstrapServers
* kafkaTopic
* kafkaPartition
* kafkaRecordKey

## Kafka Record

As soon as the publisher starts to publish data, the kafka subscribers will start to receive the message.
The subscribers will send a record with custom headers and a payload.

### Kafka Record Headers

| Header name | Description |
|-------------|-------------|
| X-Axway-Streams-Subscription-Id | Unique identifier of the kafka subscription. |
| X-Axway-Streams-Topic-Id | Identifier of the topic to which the subscription belongs. |
| X-Axway-Streams-Event-Id | Identifier of the event. |
| X-Axway-Streams-Event-Type | Type of the payload (snapshot, patch or error). |

#### Kafka payload samples

Below some examples of kafka payloads according to the type of event:

##### Snapshot payload sample

```json
[{
  "id": "acb07740-6b39-4e8b-a81a-0b678516088c",
  "title": "94% of Banking Firms Can’t Deliver on ‘Personalization Promise’",
  "date": "2018-09-10-T10:13:32",
  "abstract": "One of the strongest differentiators ..."
},{
  "id": "0c5b5894-a211-47de-87a8-c7fa3ce3dfa2",
  "title": "Would you trust your salary to start-up",
  "date": "2018-09-10-T09:59:32",
  "abstract": "We take a closer look at how safe..."
}]
```

##### Patch payload sample

```json
{
    "op":"remove",
    "path":"/1"
}
```

#### Error payload sample

```json
{
    "datetime": "2018-09-03T13:16:02.120Z",
    "code": 40000,
    "category": "subscription",
    "message": "Subscriber error"
}
```
