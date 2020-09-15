---
title: Subscribing
linkTitle: Subscribers
weight: 150
date: 2019-04-02
description: Learn how to use the different types of Subscribers supported by Streams.
---

## Subscribers

Streams supports different subscriber types. In order for a subscriber to receive messages/events published to a topic, it must subscribe either via:

* **Server-Sent Events** which enables Streams to push data to subscribers (e.g client applications) through a persistent connection.
* **Webhook** which enables Streams to notify the subscribers via a HTTP Post request performed against the registered endpoint (webhook receiver).
* **Kafka** which enables Streams to publish data to kafka clusters.

Each topic created on the platform must be associated with at least one type of subscribers.
When creating your topic, you can set it via subscribers config in the topic's configuration.

```json
{
  "name": "myTopic",
  ...
  "subscribers": {
    "sse|webhook":  {
      ...
    }
    ...
  }
  ...
}
```

If no subscribers config is provided, [SSE subscriber](../subscribers/subscriber-sse) will be added by default.

### Subscription modes

The subscription mode determines with which format the data will be sent to the subscribers.
Each subscriber can choose between different modes that determine how the data will be transmitted as far as the selected subscription mode is allowed in subscriber's configuration.

| Subscription mode | Description |
|-------------------|-------------|
| snapshot-only     | Streams sends to the subscriber the entire content (snapshot), each time a change is detected. Note: Use this mode for content which is infrequently and fully updated. |
| snapshot-patch    | Streams sends an initial event containing the entire content (snapshot), subsequent events will contain only the changed fields in the form of an array of JSON Patch operations. Refer to [Understanding snapshot-patch mode](#understanding-snapshot-patch-mode) section for details. |
| **default** | If more than one mode is allowed, the default subscription mode is the one defined by defaultSubscriptionMode of the subscriber's configuration. |

For each subscriber's config, the allowedSubscriptionModes and defaultSubscriptionMode attributes must be specified.

```json
{
  "name": "myTopic",
  ...
  "subscribers": {
    "sse": {
        "allowedSubscriptionMode": ["snapshot-only","snapshot-patch"],
        "defaultSubscriptionMode": "snapshot-patch"
    }
    "webhook": {
        "allowedSubscriptionMode": ["snapshot-only","snapshot-patch"],
        "defaultSubscriptionMode": "snapshot-only"
    }
  }
  ...
}
```

### Restricting subscription mode

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

### Defining default subscription mode

You can define the default subscription mode thanks to `defaultSubscriptionMode` attribute in associated subscriber's configuration.
The default subscription mode will be used when client does not specify any subscription mode in its subscription request.

### Understanding snapshot-patch mode

When using this subscription mode, client will only receive incremental updates computed by Streams between the last two payloads published in the topic.
For example, in the context of a brokerage app, if a user subscribes to 10 different symbols, each symbol contains different fields such as identifier, last, bid, ask. But only a few of them really change at every market tick. When using snapshot-patch mode, Streams will automatically computes the differential data and sends the corresponding JSON patch operations to the subscribers avoiding to resend fields that have not changed.

Once an initial snapshot event has been emitted, it will be followed by patch events when Streams detects a change in the published content. The following is an example of a patch sent by Streams over SSE:

```
id: 37740aa3-3629-41c4-9a7f-24a1347383eb
event: patch
data: [{"op":"remove","path":"/1"}]
```

A patch is a JSON document that gives you the difference between two JSON documents. It is represented by an array of operations to apply to the previous version of the document.

A patch operation is made of two or three fields:

* `op` defines the type of operation (e.g. add, remove, replace)
* `path` defines where the operation applies in the document (JSON Pointer)
* `value` (optional) defines the value to apply: a raw JSON literal, object or array

In the example above, there is only one operation, the patch indicates that the second row has to be removed. A patch can be applied to an existing document to alter it (several libraries are available to do that). The use of JSON patch format enables Streams to save bandwidth by pushing only the differences between two versions of published content.

### Supported JSON Patch Operation

| Operation type | Has a value? |
|----------------|--------------|
| add | yes |
| replace | yes |
| remove | no |
