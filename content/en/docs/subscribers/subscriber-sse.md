---
title: SSE Subscriber
linkTitle: SSE Subscriber
weight: 2
date: 2019-04-02
description: Learn how to configure and use the Streams Server-Sent Events Subscriber.
---

## Overview

Server-Sent Events (SSE) is part of the HTML5 standard. SSEs are sent over traditional HTTP, so they do not require a special protocol to work. SSE includes important features, such as `Last-Event-Id` header support, automatic client reconnection, and heterogeneous event handling.

## Subscribe to the topic via SSE

To subscribe to a topic, open a terminal and run the following cURL command:

```sh
export BASE_URL="base-url"
export TOPIC_ID="topic-id"

curl -v "${BASE_URL}/streams/subscribers/sse/api/v1/topics/${TOPIC_ID}
```

`topic-id` is the unique identifier of the topic you want to subscribe to.

If the connection is successfully established, Streams shows with a `200 OK` and a _Content-Type: text/event-stream_ responses.

## How SSE connection works

When you connect to an SSE server, you receive an HTTP `200 OK`. However, the connection remains alive and everything continues to happen afterwards, including errors (for example, authentication errors, bad requests, and son on). As long as the client, or the server, does not end the connection, it remains alive.

SSE is a text-based protocol. The following is an example of the response of the server after the connection is successfully established, and a first message has been published:

```
id: 00ae73f5-5349-40c4-91b6-2e58a36b5365#1
event: snapshot 
data : [{
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

| Configuration Entry | Description |
|---------------------|-------------|
| id | The unique identifier of the event |
| event | Definie the type of the event. Refer to [type of events](#type-of-events) section
| data | Refer to [subscription modes](/docs/subscribers/#subscription-modes) section |

{{< alert title="Note" >}}`id`, `event`and `data` fields are always present and represent a single message, also called an event.{{< /alert >}}

## Compress an SSE

You can compress SSE on demand by using Gzip or deflate methods. The following is an example of how to use the `Accept-Encoding` header:

```sh
export BASE_URL="base-url"
export TOPIC_ID="topic-id"

curl -v "${BASE_URL}/streams/subscribers/sse/api/v1/topics/${TOPIC_ID}" -H "Accept-Encoding: gzip, deflate" --compress
```

If this header is not provided, the default behavior is not to compress the data.

## Reconnect automatically after an interruption

SSE has the ability for clients to automatically reconnect if the connection is interrupted. Furthermore, the data stream continues from the point it disconnected, so no events are lost.

Each message sent by Streams is uniquely identified. Using the built-in header `Last-Event-Id` after reconnecting, the client can tell Streams where in the events streams to resume. This mechanism is automatically integrated in most clients, but you can also achieve it by running the following curl command:

```sh
export BASE_URL="base-url"
export TOPIC_ID="topic-id"

curl -v "${BASE_URL}/streams/subscribers/sse/api/v1/topics/${TOPIC_ID}" -H "Last-Event-Id: 00ae73f5-5349-40c4-91b6-2e58a36b5365#1"
```

## Connection heartbeat

In certain cases, some legacy network infrastructure may drop HTTP connections after a short timeout. To protect against such behaviors, Streams sends the client a comment line (starting with a ':' character) every 5 seconds. This comment line is ignored by the SSE client and has no effect other than a very limited network consumption.

When no change is detected by Streams, the subscribers gets those heartbeats repeatedly until an event is finally sent.

## Select a subscription mode

The client can select the subscription mode by setting the `Accept` header in its subscription request:

| Subscription Mode | Accept Header Value |
|-------------------|---------------------|
| snapshot-only | `application/vnd.axway.streams+snapshot-only` |
| snapshot-patch | `application/vnd.axway.streams+snapshot-patch` |
| event | `application/vnd.axway.streams+event` |
| default | `""` or  `*/*` or `text/event-stream` |

If the client requests a subscription mode not allowed by the configuration of the topic, a `406 Not Acceptable` is be returned.

Refer to [subscription modes](/docs/subscribers/#subscription-modes) and [subscription error](/docs/subscribers/subscribers-errors/) section for more details.
