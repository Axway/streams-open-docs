---
title: WebSocket Subscriber
linkTitle: WebSocket Subscriber
weight: 4
date: 2021-08-03
description: Learn how to configure and use the Streams WebSocket Subscriber.
---

## Overview

Streams WebSocket Subscriber allows clients to subscribe to a topic using websocket protocol. It allows bi-directionnal communication between Streams and clients.

{{< alert title="Warning" >}}This subscriber is still in beta.{{< /alert >}}

## Subscribe to the topic via WebSocket

To subscribe to a topic, you need to use a websocket client. You can find a lot of client library in many languages, so we will only describe high level configuration.

### Subscription request

The url to connect to WebSocket Subscriber is `<BASE_URL>/streams/subscribers/websocket/api/v1/topics` where `BASE_URL` is the url to contact your Streams instance.

Once your websocket client is connected, a subscription request must be sent:

```json
{
    "topicIdOrName": "0387d8ff-b20a-43c9-b088-463f0e16fcdc",
    "subscriptionMode": "snapshot-only"
}
```

| Configuration Entry | Mandatory | Default value | Description |
|---------------------|-----------|---------------|-------------|
| topicIdOrName | yes | n/a | The unique identifier or the name of the topic you want to subscribe to |
| subscriptionMode | no | Default subscription mode defined in the topic's configuration | Refer to [subscription modes](/docs/subscribers/#subscription-modes) section |
| dataFormat | no | binary | The format of the data requested. Refer to [data format](#data-format) section |
| lastEventId | no | n/a | Refer to [Reconnect after an interruption](#reconnect-after-an-interruption) section |

### Events response

Once the websocket subscription is successfully created, Streams will publish events into websocket channel. The events published will look like :

```json
{
    "id": "0387d8ff-b20a-43c9-b088-463f0e16fcdc#12",
    "type": "snapshot",
    "data": {
                "id": "0c5b5894-a211-47de-87a8-c7fa3ce3dfa2",
                "title": "Would you trust your salary to start-up",
                "date": "2018-09-10-T09:59:32",
                "abstract": "We take a closer look at how safe..."
            }
}
```

| Configuration Entry | Description |
|---------------------|-------------|
| id | The unique identifier of the event |
| type | Definie the type of the event. Refer to [type of events](#type-of-events) section
| data | Depending on your request's data format will be either string or base64 format of the published data. Refer to [data format](#data-format) and [subscription modes](/docs/subscribers/#subscription-modes) sections |

## Data format

You can define the format of the `data` attribute from websocket response.

By default, the data format is `binary` so the `data` attribute will contain a binary form with base64 encoded of the data published into the subscribed topic.

If you choose to use `text` format, the `data` attribute will contain a readable string form of the data published into the subscribed topic.

## Reconnect after an interruption

In case of connection interruption, you have the capability to resume your stream when subscribing.

Every events published by the websocket subscriber contains an unique identifier. This identifier could be used when you are reconnnecting to Streams using the `lastEventId` attribute from the subscription request.