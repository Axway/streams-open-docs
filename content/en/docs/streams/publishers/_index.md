---
title: Publishing
linkTitle: Publishers
weight: 150
date: 2019-04-02
description: Learn how to use the different types of Publishers supported by Streams.
---

## Selecting your type of publisher

Streams supports different publishers and each topic must be associated with one publisher.
When creating your topic, you must define a name, the type of publisher and its configuration under the publisher node of topic's configuration:

```json
{
  "name": "myTopic",
  "publisher": {
    "type": "http-poller|http-post|kafka|sfdc",
    "config": { ... }
  }
  ...
}
```

### Publishing in the absence of a subscriber

You can control whether or not the publisher is allowed to publish content if no subscriber is currently subscribed to the topic.
Setting `alwayOn` flag to `true`, will ensures that any new subscriber will receive the latest published value as soon as they reconnect.
Setting `alwayOn` flag to `false`, can be useful to enable the publisher to avoid publishing content in a topic which is currently not subscribed by any subscriber.

```json
{
  "name": "myTopic",
  "publisher": {
    "type": "http-poller|http-post|kafka|sfdc",
    "config": { ... },
    "alwaysOn": true|false,
    ...
  }
  ...
}
```

`alwaysOn` flag is optional and will be set to `false` if no value is provided.

### Publishing payloads

A publisher can publishes updated version of a data set over time.
Whenever a change is detected compare to the previous payload published, Streams will notify subscribers based on their subscription modes.

Let's take a real life example with a subscriber being subscribed using `snapshot-patch` mode.
A publisher publishes the latest top news (for the sake of simplicity let's say our source publishes only the two latest news):

Publication `1` (t0): A first `snapshot` event representing the last value published in Streams topic will be sent "as is" as the first event after client connection is successfully established:

```json
[{
   "id": "acb07740-6b39-4e8b-a81a-0b678516088c",
   "title": "94% of Banking Firms Can’t Deliver on ‘Personalization Promise’",
   "date": "2019-09-10-T10:13:32",
   "abstract": "One of the strongest differentiators ..."
},{
   "id": "0c5b5894-a211-47de-87a8-c7fa3ce3dfa2",
   "title": "Would you trust your salary to start-up",
   "date": "2019-09-10-T09:59:32",
   "abstract": "We take a closer look at how safe..."
}]
```

Publication `2` (t0+1): the published payload is exactly the same as the previous publication, nothing is sent to subscribers.

Publication `3` (t0+2): the oldest headline is gone and a new headline is added:

```json
[{
   "id": "55d21525-af74-4b9f-944a-e43a48147d80",
   "title": "How to Navigate Competing Regulations: Unintended Consequences of GDPR",
   "date": "2018-09-10-T10:14:18",
   "abstract": "GDPR and MiFID II can create a tension between retention ..."
},{
   "id": "acb07740-6b39-4e8b-a81a-0b678516088c",
   "title": "94% of Banking Firms Can’t Deliver on ‘Personalization Promise’",
   "date": "2018-09-10-T10:13:32",
   "abstract": "One of the strongest differentiators ..."
}]
```

As a result subscribers to the topic will receive a `patch` event:

```json
[{
   "op":"add",
   "path":"/0",
   "value": {
      "id":"55d21525-af74-4b9f-944a-e43a48147d80",
      "title":"How to Navigate Competing Regulations: Unintended Consequences of GDPR",
      "date":"2018-09-10-T10:14:18",
      "abstract":"GDPR and MiFID II can create a tension between retention ..."
   }
},{
   "op":"remove",
   "path":"/2"
}]
```

JSON patch is not the only subscription mode available. See [Subscription modes](../subscribers#subscription-modes) section for more details.
