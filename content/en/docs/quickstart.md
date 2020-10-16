---
title: Get started with Axway Streams
linkTitle: Get started
weight: 1
date: 2019-04-02
description: Learn how to create your first Event-Driven API with Streams.
---

## Before you start

* Register to Streams Early Adopter Program to get access to Streams and installation materials.
* Read [Understand Streams concepts](/docs/concepts).
* [Install Streams](/docs/install) in your kubernetes cluster.

## Objectives

Learn how to create your first Event-Driven API with Streams.

* Create a topic
* Publish payloads to the topic
* Subscribe to the topic

## Create a topic

Topics are a central concepts in Streams and represents a feed of messages.
Each topic must be associated with one [publisher](../publishers/) in charge of publishing payloads to be consumed by subscribers.

To start, we will create a topic associated with a [HTTP Poller publisher](../publishers/publisher-http-poller) which will be responsible for polling a target URL and automatically publishing the content retrieved at the given polling period.

To do so, perform a request `POST /topics` endpoint with following body:

```json
{
  "name": "myHttpPollerTopic",
  "publisher": {
    "type": "http-poller",
    "config": {
        "url": "https://stockmarket.streamdata.io/v2/prices",
        "pollingPeriod": "PT5S"
    }
  }
}
```

## Publish payloads to the topic

The [HTTP Poller publisher](../publishers/publisher-http-poller) will start to poll & publish the content retrieved from the target `url` as soon as the first subscriber connects to the topic. Polling will be automatically stopped once the last subscriber has unsubscribed from the topic.

## Subscribe to the topic

Streams provide different Event-Driven [subscribers](../subscribers) to allow any consumers to subscribe to a topic.
We will use Streams [SSE Subscriber](../subscribers/subscriber-sse) by simply opening a terminal and running the following cURL command:

```sh
export BASE_URL="base-url"
export TOPIC_ID="topic-id"

curl "${BASE_URL}/subscribers/sse/topics/${TOPIC_ID}"
```

`base-url` depends on your deployment configuration. `topic-id` is the unique identifier of the topic automatically assigned on creation.

If the connection is successfully established, Streams will respond with a `200 OK` and send events through your first Event-Driven API!

## Review

You have learned how to create a topic with Streams and automatically publish content thanks to Streams HTTP Poller publisher. You have also learned, as a consumer, how to subscribe to a topic thanks to Server-Sent Events.
