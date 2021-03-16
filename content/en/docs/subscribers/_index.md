---
title: Subscribing
linkTitle: Subscribers
weight: 4
date: 2019-04-02
description: Learn how to use the different types of Subscribers supported by Streams.
---

Streams supports different subscriber types. In order for a subscriber to receive events associated to a topic, it must subscribe either via:

* **Server-Sent Events** which enables Streams to push data to subscribers (e.g., client applications) through a persistent HTTP connection.
* **Webhook** which enables Streams to notify the subscribers via a HTTP Post request performed against the registered endpoint (webhook receiver).
* **Kafka** which enables Streams to publish data to a Kafka topic/partition.

Each topic created on the platform must be associated with at least one type of subscribers.
When creating your topic, you can set it via subscribers config in the topic's configuration.

```json
{
  "name": "myTopic",
  ...
  "subscribers": {
    "sse|webhook|kafka":  {
      ...
    }
    ...
  }
  ...
}
```

If no subscribers is defined, the [SSE subscriber](../subscribers/subscriber-sse) will be added by default.

## Subscription modes

The subscription mode determines with which format and type of events the data will be sent to the subscribers.
Each subscriber can choose between different modes that determine how the data will be transmitted (based on the selected subscription mode in the subscriber's configuration).

| Publisher Payload type | Subscription mode | Description |
|------------------------|-------------------|-------------|
| `snapshot`   | `snapshot-only`   | Streams sends to the subscriber the entire content (snapshot), each time a change is detected. Note: Use this mode for content which is infrequently and fully updated. |
| `snapshot`   | `snapshot-patch`  | Streams sends an initial event containing the entire content (snapshot), subsequent events will contain only the changed fields in the form of an array of JSON Patch operations. Refer to [Understanding snapshot-patch mode](#understanding-snapshot-patch-mode) section for details. |
| `event`      | `event`           | Streams sends the published events as is over time. |

{{< alert title="Note" >}}The subscription modes depends on the [publisher payload type](../publishers/#selecting-your-type-of-publisher) defined for the topic.{{< /alert >}}

For each subscriber's config, the `allowedSubscriptionModes` and `defaultSubscriptionMode` attributes must be specified:

```json
{
  "name": "myTopic",
  ...
  "subscribers": {
    "sse": {
        "allowedSubscriptionMode": ["snapshot-only","snapshot-patch"],
        "defaultSubscriptionMode": "snapshot-patch"
    },
    "webhook": {
        "allowedSubscriptionMode": ["snapshot-only","snapshot-patch"],
        "defaultSubscriptionMode": "snapshot-only"
    }
  }
  ...
}
```

### Understanding `event` subscription mode

This mode is the only available mode when the topic is configured with a data source publishing payloads of type `event`.
Subscribers receives event as published by the publisher.

For example:

```
id: 37740aa3-3629-41c4-9a7f-24a1347383eb
event: event
data: {
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

The subscribers will only receive **incremental updates** computed by Streams between the last two payloads published in the topic.
For example, in the context of a brokerage app, if a user subscribes to 10 different symbols, each symbol contains different fields such as identifier, last, bid, ask. But only a few of them really change at every market tick. When using `snapshot-patch` mode, Streams will automatically computes the differential data and sends the corresponding JSON patch operations to the subscribers avoiding to resend fields that have not changed.

Once an initial `snapshot` event has been emitted, it will be followed by `patch` events when Streams detects a change in the published content.

For example, given a first snapshot published in a topic:

```json
{ 
  "baz": "qux",
  "foo": "bar"
}
```

The subscriber will receive an initial event of type `snapshot` containing the complete data set as follow:

```
id: 37740aa3-3629-41c4-9a7f-24a1347383eb
event: snapshot
data: { 
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

The subscriber will now receive an event of type `patch` containing the list of patch operations to apply on the initial snapshot:

```
id: 37740aa3-3629-41c4-9a7f-24a1347383eb
event: patch
data: [ 
  { "op": "replace", "path": "/baz", "value": "boo" },
  { "op": "add", "path": "/hello", "value": ["world"] },
  { "op": "remove", "path": "/foo" }
]
```

A `patch` is a JSON document that provides the difference between two JSON documents. It is represented by an array of operations to apply to the previous version of the document.

A patch operation is made of the following fields:

* `op`: defines the type of operation (e.g. add, remove, replace)
* `path`: defines where the operation applies in the document (JSON Pointer)
* `value`: (optional) defines the value to apply: a raw JSON literal, object or array

A patch can be applied to an existing document to alter it (several open-source libraries are available). The use of [JSON patch](http://jsonpatch.com/) format enables Streams to save bandwidth by pushing only the differences between two versions of a published content.

#### Supported JSON Patch Operation

##### Add Operation

```json
  { "op": "add", "path": "/hello", "value": ["world"] },
```

Adds a value to an object or inserts it into an array. In the case of an array, the value is inserted before the given index. The - character can be used instead of an index to insert at the end of an array.

##### Replace Operation

```json
  { "op": "replace", "path": "/baz", "value": "boo" }
```

Replaces a value. Equivalent to a `remove` followed by an `add`.

##### Remove Operation

Removes a value from an object or array.

```json
  { "op": "remove", "path": "/foo" }
```

### Understanding `snapshot-only` subscription mode

In this mode the subscriber will only receive events of type `snapshot` **only** when a change is detected by Streams.

If the publisher publishes twice the same payload:

```json
{ 
  "baz": "qux",
  "foo": "bar"
}
```

The subscribers will not receive any event.

If the publisher publishes a payload containing changes compare to previously published payload:

```json
{ 
  "baz": "boo", 
  "hello": ["world"] 
}
```

The subscriber will receive a event of type `snapshot` containing the full data set:

```
id: 37740aa3-3629-41c4-9a7f-24a1347383eb
event: snapshot
data: { 
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

You can define the default subscription mode thanks to `defaultSubscriptionMode` attribute in associated subscriber's configuration.
In case you don't define a default subscription mode, one is defined either by using the first item of `allowedSubscriptionModes` or depending on the publisher payload type.

| Publisher Payload type | defaultSubscriptionMode |
|------------------------|-------------------------|
| snapshot               | snapshot-patch          |
| event                  | event                   |

* The default subscription mode will be used when client does not specify define any subscription mode in its subscription request.
* If the subscriber subscribes to a topic with a subscription mode not allowed, its subscription request will be rejected.
