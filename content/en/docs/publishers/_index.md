---
title: Publishing
linkTitle: Publishers
weight: 3
date: 2019-04-02
description: Learn how to use the different types of Publishers supported by Streams.
---

## Selecting your type of publisher

Streams supports different publishers and each topic must be associated with one type of publisher.
When creating your topic, you must define a name for the topic, the type of publisher and its configuration:

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

### Type of data source

Streams can adapt to different type of data sources. We distinguish data sources that provide a full data set (snapshot) from data sources able to directly publish events.

#### Configuring the type of data source

You must configure Streams in regards of the type of data source it will connect to and set the `payload.type` attribute accordingly:

```json
{
  "name": "myTopic",
  "publisher": {
    ...
    "payload": {
      "type": "snapshot|event"
    }
    ...
  }
  ...
}
```

{{< alert title="Note" >}}The payload type cannot be changed once the topic is created.{{< /alert >}}

#### Snapshot data source

To used when the data source provides an updated version of a full data set over time.

For example an Rest Json API providing the list of top 10 headline news. In case of breaking news, an additional entry will be added to the response of the API, replacing the oldest entry:

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
},...]
```

When configured to connect to a `snapshot` data source, Streams will always compute **incremental updates** by comparing the previous snapshot to the newly published snapshot. Streams acts as a change data capture layer able to generate change events from what is being publish in the topic. With this type of payload, it is possible to configure additional subscription modes so that subscribers choose the type of event they wish to receive from Streams. See [subscription modes](../subscribers#subscription-modes) for details.

#### Event data source

These data sources do not provide the complete data set but the events representing the change that occurred on a specific resource in the form of a Json Object.

For example a change on the Lead object in Salesforce:

```json
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

When configured to connect to an `event` data source, Streams does not compute **incremental updates** and acts as an Event Hub that forwards events as is to all subscribers defined in the topic. In this case the subscription mode is forced to `event`. See [Subscription modes](../subscribers#subscription-modes) section for more details.

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
