---
title: SSE Subscriber
linkTitle: SSE Subscriber
weight: 3
date: 2019-04-02
description: Learn how to configure and use the Streams Server-Sent Events Subscriber.
---

Server-Sent Events (SSE) is part of the HTML5 standard. SSEs are sent over traditional HTTP, so it doesn't require a special protocol to get working. SSE embedded important features such event identifier, automatic reconnection or the ability to manage heterogeneous events.

## Enabling SSE subscription on a topic

To enable SSE clients to subscribe to a topic, you must configure a `sse` subscriber in the topic's configuration and optionally configured your desired [subscription modes](../#subscription-modes).

```json
{
  "name": "myTopic",
  ...
  "subscribers": {
    "sse":  {
      ...
    }
    ...
  }
  ...
}
```

## Subscribing to the topic via SSE

You can quickly try by opening a terminal and running the following cURL command:

```sh
export BASE_URL="base-url"
export TOPIC_ID="topic-id"

curl -v "${BASE_URL}/streams/subscribers/sse/api/v1/topics/${TOPIC_ID}
```

where `topic-id` is the unique identifier of the topic you want to subscribe to.

If the connection is successfully established, Streams will respond with a 200 OK and a _Content-Type: text/event-stream_.

### How SSE is used

When you connect to an SSE server you receive an HTTP 200 OK code just like a regular successful HTTP connection. However, the connection remains alive and everything continues to happen afterwards, including errors (e.g. authentication errors, bad requests). As long as the client or server does not end the connection, it remains alive.

SSE is a text-based protocol. The following is an example of the server’s response once the connection is successfully established (the metadata, headers, status codes are omitted intentionally):

{{< highlight go "linenos=inline" >}}
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
{{< / highlight >}}

Line number:
`1`: `id` identifies the message.
`2`: `event` is the name of the event that can be either snapshot, patch or error.
`3`: `data` is the body of the message, always in JSON, in this case a JSON array.

These three fields are always present and represent a single message also called an event.

### Compression

SSE can be compressed on demand using gzip or deflate methods. The following is an example of how to use the `Accept-Encoding` header:

```sh
export BASE_URL="base-url"
export TOPIC_ID="topic-id"

curl -v "${BASE_URL}/streams/subscribers/sse/api/v1/topics/${TOPIC_ID}" -H "Accept-Encoding: gzip, deflate" --compress
```

If this header is not provided, the default behavior is not to compress the data.

### Last-Event-Id

SSE has the ability for clients to automatically reconnect if the connection is interrupted. Furthermore, the data stream continues from the point it disconnected, so no events are lost.

Each messages sent by Streams are uniquely identified, so using the built-in header `Last-Event-id` after a reconnection, the client can tell to Streams where in the events streams to resume. Such mechanism is automaticaly integrated in most clients but you can also acheive it using curl command, using the example given above it will be :

```sh
export BASE_URL="base-url"
export TOPIC_ID="topic-id"

curl -v "${BASE_URL}/streams/subscribers/sse/api/v1/topics/${TOPIC_ID}" -H "Last-Event-Id: 00ae73f5-5349-40c4-91b6-2e58a36b5365#1"
```

### Connection heartbeat

In certain cases, some legacy network infrastructure may drop HTTP connections after a short timeout. To protect against such behaviors, Streams sends the client a comment line (starting with a ':' character) every 5 seconds. This comment line is ignored by the SSE client and has no effect other than a very limited network consumption.

When no change is detected by Streams, the subscribers gets those heartbeats repeatedly until an event is finally sent.

### Type of SSE events

When using `snapshot-patch` subscription mode, the `snapshot` event is only emitted once, after the connection is successfully established. Subsequent event will be named 'patch'.

When using `snapshot-only` subscription mode, only `snapshot` events will be emitted when a change is detected in the content published in the topic.

An `error` event can also be emitted whenever a error occurs. Refer to [Errors during subscription](../subscribers-errors#errors-during-subscription) section for details.

### Selecting the subscription mode

The client can select the subscription mode by setting the `Accept` header in its subscription request:

| Subscription Mode | Accept Header Value |
|-------------------|---------------------|
|snapshot-only | `application/vnd.axway.streams+snapshot-only` |
|snapshot-patch | `application/vnd.axway.streams+snapshot-patch` |
| **default** | `""` or  `*/*` or `text/event-stream` |

If the client requests a subscription mode not allowed by topic's configuration, a `406 Not Acceptable` will be returned.
