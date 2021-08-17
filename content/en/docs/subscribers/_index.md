---
title: Subscribing
linkTitle: Subscribers
weight: 4
date: 2019-04-02
description: Learn how to use the different types of Subscribers supported by Streams.
---

Streams support different subscriber types. In order for a subscriber to receive events associated to a topic, it must subscribe using one of the following options:

* **Kafka**, which enables Streams to publish data to a Kafka topic partition.
* **Server-Sent Events**, which enables Streams to push data to subscribers, for example, client applications, via a persistent HTTP connection.
* **Webhook**, which enables Streams to notify the subscribers via a HTTP POST request performed against the registered endpoint (webhook receiver).
* **WebSocket**, which enables Streams to notify the subscribers via persistent WebSocket connection.

Each topic created on the platform must be associated with at least one type of subscribers.

When creating your topic, you can set it via the subscribers `config` parameter, in the topic's configuration.

```json
{
  "name": "myTopic",
  ...
  "subscribers": [
    {
      "type": "kafka|sse|webhook|websocket",
      "config": {
        ...
      }
    }
  ]
  }
  ...
}
```

If no subscriber is defined, the [SSE subscriber](/docs/subscribers/subscriber-sse) is added by default.

## Quality Of Service (QoS)

Streams has strong requirements in terms of both quality of service and performance. To provide the best trade-off between these two conflicting aspects, Streams supports **at-least-once** delivery semantic.

We ensure this quality of service by keeping the last event ID delivered for each subscription to resume from it in case of failure (for example, network failure, component failure). The mechanism is internally managed by Streams for persistent subscribers, such as Webhook or Kafka subscribers, but depends on a client side mechanism for SSE. For more information, see [Reconnect automatically after an interruption](/docs/subscribers/subscriber-sse#reconnect-automatically-after-an-interruption).

## Subscription modes

The subscription mode determines the format of the data and the type of events that will be sent to the subscribers.
Each subscriber can choose between different modes that determine how the data will be transmitted (based on the selected subscription mode in the subscriber's configuration).

| Publisher Payload type | Subscription mode | Description |
|------------------------|-------------------|-------------|
| `snapshot`   | `snapshot-only`   | Streams sends the entire content (snapshot) to the subscriber each time a change is detected. We recommend you to use this mode for content, which doesn't occur frequently and is fully updated. |
| `snapshot`   | `snapshot-patch`  | Streams sends an initial event containing the entire content (snapshot). The subsequent events contain only the changed fields in the form of an array of JSON Patch operations. For more information, see [Understanding snapshot-patch mode](#understanding-snapshot-patch-mode). |
| `event`      | `event`           | Streams sends the published events, as-is, over time. |

{{< alert title="Note" >}}Subscription modes depend on the [publisher payload type](/docs/publishers/#selecting-your-type-of-publisher) defined for the topic.{{< /alert >}}

The `allowedSubscriptionModes` and `defaultSubscriptionMode` attributes must be specified for each subscriber's configuration:

```json
{
  "name": "myTopic",
  ...
  "subscribers": [
    {
      "type": "sse",
      "allowedSubscriptionMode": ["snapshot-only","snapshot-patch"],
      "defaultSubscriptionMode": "snapshot-patch"
    },
    {
      "type": "webhook",
      "allowedSubscriptionMode": ["snapshot-only","snapshot-patch"],
      "defaultSubscriptionMode": "snapshot-only"
    }
  ]
  ...
}
```

### Understanding `event` subscription mode

The `event` subscription mode is the only available mode when the topic is configured with a data source publishing payloads of type `event`. Subscribers receive event as published by the publisher.

For example:

```
{
  "Status":"Working - Contacted",
  "LastModifiedDate":"2021-02-26T14:14:44.000Z",
  "ChangeEventHeader":{
    "entityName":"Lead",
    "changeType":"UPDATE",
    "changedFields":["Status","LastModifiedDate"],
    "transactionKey":"0002a8c8-3c33-f5b9-9152-xxxxxx",
    "commitTimestamp":1614348884000,
    "recordIds":["00Q1t00000xxxxx"]
  }
}
```

### Understanding `snapshot-patch` subscription mode

In the `snapshot-patch` subscription mode, subscribers only receive **incremental updates** computed by Streams between the last two payloads published in the topic. For example, in the context of a brokerage app, if a user subscribes to 10 different symbols, each symbol contains different fields such as identifier, last, bid, ask. But only a few of them change at every market tick. When using `snapshot-patch` mode, Streams automatically computes the differential data and sends the corresponding JSON Patch operations to the subscribers, avoiding resending the fields that have not changed.

Once an initial `snapshot` event has been emitted, it will be followed by `patch` events when Streams detects a change in the published content.

For example, given a first snapshot published in a topic:

```json
{ 
  "baz": "qux",
  "foo": "bar"
}
```

The subscriber receives an initial event of type `snapshot` containing the complete data set as follow:

```
{ 
  "baz": "qux",
  "foo": "bar"
}
```

If the publisher publishes a second snapshot:

```json
{ 
  "baz": "boo", 
  "hello": ["world"] 
}
```

The subscriber now receives an event of type `patch` containing the list of patch operations to apply on the initial snapshot:

```
[ 
  { "op": "replace", "path": "/baz", "value": "boo" },
  { "op": "add", "path": "/hello", "value": ["world"] },
  { "op": "remove", "path": "/foo" }
]
```

A `patch` is a JSON document that provides the difference between two JSON documents. It is represented by an array of operations to apply to the previous version of the document.

A patch operation takes the following fields:

* `op`: defines the type of operation. For example, add, remove, replace.
* `path`: defines where the operation applies in the document (JSON Pointer).
* `value`: (optional) defines the value to apply: a raw JSON literal, object, or array.

You can use a patch to modify an existing document. The use of [JSON Patch](http://jsonpatch.com/) format enables Streams to save bandwidth by pushing only the differences between two versions of a published content.

#### Supported JSON Patch operations

The following are supported JSON patch operations in Streams.

##### Add

Adds a value to an object or inserts it into an array. In the case of an array, the value is inserted before the given index. The `-` character can be used instead of an index to insert values at the end of an array.

```json
  { "op": "add", "path": "/hello", "value": ["world"] },
```

##### Replace

Replaces a value. Equivalent to `remove` followed by `add`.

```json
  { "op": "replace", "path": "/baz", "value": "boo" }
```

##### Remove

Removes a value from an object or array.

```json
  { "op": "remove", "path": "/foo" }
```

### Understanding `snapshot-only` subscription mode

In this mode, the subscriber receives events of type `snapshot` **only** when a change is detected by Streams.

If the publisher publishes twice the same payload:

```json
{ 
  "baz": "qux",
  "foo": "bar"
}
```

the subscribers does not receive any event.

If the publisher publishes a payload containing changes compared to previously published payload:

```json
{ 
  "baz": "boo", 
  "hello": ["world"] 
}
```

the subscriber receives an event of type `snapshot` containing the full data set:

```
{ 
  "baz": "boo", 
  "hello": ["world"] 
}
```

## Restricting subscription mode

You can restrict the list of subscription modes in which subscribers can subscribe to the topic by configuring the property `allowedSubscriptionModes` with the list of allowed subscription modes you want to allow:

```json
{
    "name": "topic-1570803096398",
    ...
    "subscribers": {
        "sse": {
            "allowedSubscriptionModes": [
                "snapshot-only",
                "snapshot-patch"
            ],
            "defaultSubscriptionMode": "snapshot-patch"
        }
        ...
    },
    ...
}
```

## Defining default subscription mode

You can define the default subscription mode with the  `defaultSubscriptionMode` attribute in the associated subscriber's configuration. If you don't define a default subscription mode, one is defined either by using the first item of `allowedSubscriptionModes` or depending on the publisher payload type.

| Publisher Payload type | defaultSubscriptionMode |
|------------------------|-------------------------|
| snapshot               | snapshot-patch          |
| event                  | event                   |

* The default subscription mode is used when the client does not define a subscription mode in the subscription request.
* If the subscriber subscribes to a topic with a subscription mode not allowed, its subscription request is rejected.
