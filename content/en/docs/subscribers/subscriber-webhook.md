---
title: Webhook Subscriber
linkTitle: Webhook Subscriber
weight: 1
date: 2019-04-02T00:00:00.000Z
description: Learn how to configure and use the Streams Webhook Subscriber.
---

## Overview

Streams Webhook subscriber allows clients to be notified via HTTP Post requests made by Streams to the endpoint provided during their subscription.

## Creating a Webhook subscription

You can create a webhook subscription by making an HTTP Post request on the following endpoint:

`POST /subscribers/webhook/topics/{topicID}/subscriptions`

The body must contain a JSON webhook subscription configuration as follow:

```json
{
    "webhookUrl": "https://valid.url/of/webhook",
    "webhookHeaders": {
      "Authorization"   : "Bearer AbCdEf123456"
    },
    "subscriptionMode": "snapshot-only|snapshot-patch"
}
```

| Configuration Entry | Mandatory | Default value | Description |
|---------------------|-----------|---------------|-------------|
| webhookUrl | yes | n/a | URL which will be called by Streams in order to inform the subscriber that a new event/message has been published in the topic identified by {topicId}. |
| webhookHeaders | no | n/a | Map of key/value which will send by Streams to the subscriber |
| subscriptionMode | no | Default subscription mode defined in the topic's configuration | Refer to [subscription modes](/docs/subscribers/#subscription-modes) section |

Once the webhook subscription is successfully created, Streams will start notifying the subscriber at the specified `webhookUrl`.

### Create status codes

Below the list of HTTP status codes that can be returned when trying to create a webhook subscription:

| Code | Comment |
|------|---------|
| 201 Created | Indicates that the subscription request is valid and has been created. |
| 400 Bad Request | Indicates that the provided data are invalid. |
| 404 Not found | Indicates that the requested URL does not exist. |

## Stopping a webhook subscription

In order to stop the sending of webhook notifications, simply delete the corresponding webhook subscription with following request:

`DELETE /subscribers/webhook/subscriptions/{subscriptionId}`

### Delete status codes

Below the list of HTTP status codes that can be returned when deleting the webhook subscription

| Code | Comment |
|------|---------|
| 204 No Content | Indicates that the subscription has been successfully deleted.
| 404 Not found | Indicates that the provided identifier does not correspond to an existing webhook subscription.

## Getting a webhook subscription

In order to get existing subscription, simply do the following GET request:

`GET /subscribers/webhook/subscriptions/{subscriptionId}`

### Get status codes

Below the list of HTTP status codes that can be returned when trying to get a kafka subscription:

| Code | Comment |
|------|---------|
| 200 Ok | Indicates that the subscription requested is valid and has been retrieved. |
| 404 Not found | Indicates that the requested URL or subscription requested does not exist. |

## Getting webhook subscriptions for a topic

In order to get existing subscriptions, simply do the following GET request on your topic:

`GET /subscribers/webhook/topics/{topicId}/subscriptions`

See [pagination](/docs/topics-api/#pagination) to get more information about how pagination and sorting works.

The field names allowed for sorting are :

* subscriptionMode
* webhookUrl

## Webhook Event

As soon as the publisher starts to publish data, the webhook subscribers will start to receive the events via webhook callbacks.

The webhook call is an HTTP POST request that contains two types of data: headers and a payload.

### Webhook Event Headers

| Header name | Description |
|-------------|-------------|
| X-Axway-Streams-Subscription-Id | Unique identifier of the webhook subscription. |
| X-Axway-Streams-Topic-Id | Identifier of the topic to which the subscription belongs. |
| X-Axway-Streams-Event-Id | Identifier of the event. |
| X-Axway-Streams-Event-Type | Type of the payload (snapshot, patch or error). |
| Webhook Event Payload | See [Webhook payload samples](#webhook-payload-samples). |

#### Webhook payload samples

Below some examples of webhook payloads according to the type of event:

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
