---
title: WebSocket Subscriber
linkTitle: WebSocket Subscriber
weight: 4
date: 2021-08-03
description: Learn how to configure and use the Streams WebSocket subscriber.
---

Streams WebSocket subscriber allows clients to subscribe to a topic using websocket protocol. It allows bi-directional communication between Streams and clients.

{{< alert title="Caution" color="warning" >}}This subscriber is a beta feature.{{< /alert >}}

## Subscribe to the topic via WebSocket

To subscribe to a topic, you must use a websocket client. There are many client libraries available, in many languages, so on this page, we are only describing a high level configuration.

### Subscription request

The URL to connect to WebSocket Subscriber is `<BASE_URL>/streams/subscribers/websocket/api/v1/topics`, where `BASE_URL` is the URL to contact your Streams instance.

After your websocket client is connected, a subscription request must be sent:

```json
{
    "topicIdOrName": "0387d8ff-b20a-43c9-b088-463f0e16fcdc",
    "subscriptionMode": "snapshot-only"
}
```

| Configuration Entry | Mandatory | Default value | Description |
|---------------------|-----------|---------------|-------------|
| topicIdOrName | yes | n/a | The unique identifier or the name of the topic you wish to subscribe to. |
| subscriptionMode | no | Default subscription mode defined in the topic's configuration | For more information, see [subscription modes](/docs/subscribers/#subscription-modes) section. |
| dataFormat | no | binary | The format of the data requested. For more information, see  [data format](#data-format) section. |
| lastEventId | no | n/a | For more information, see [Reconnect after an interruption](#reconnect-after-an-interruption) section. |

### Events response

After the websocket subscription is successfully created, Streams will publish events into websocket channel. The events published look like the following:

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
| id | The unique identifier of the event. |
| type | Define the type of the event. For more information, see [type of events](#type-of-events) section.
| data | Depending on your request, the data format will be either `string` or `base64` format of the published data. For more information, see [data format](#data-format) and [subscription modes](/docs/subscribers/#subscription-modes) sections. |

## Data format

You can define the format of the `data` attribute from websocket response. By default, the data format is `binary`, so the `data` attribute contains a binary form with base64 encoded of the data published into the subscribed topic.

If you choose to use `text` format, the `data` attribute will contain a readable string form of the data published into the subscribed topic.

## Reconnect after an interruption

In case of connection interruption, you have the capability to resume your stream when subscribing. Every event published by the websocket subscriber contains an unique identifier. You can use this identifier when you are reconnecting to Streams using the `lastEventId` attribute from the subscription request.