---
title: Get started with Axway Streams
linkTitle: Get started
weight: 1
date: 2019-04-02
description: Learn how to create a topic with Streams and automatically publish content with Streams HTTP Poller publisher. Also learn, as a consumer, how to subscribe to a topic using server-sent events (SSE).
---

## Before you start

* Register to Streams Early Adopter Program to get access to Streams and installation materials.
* Read [Understand Streams concepts](/docs/concepts).
* [Install Streams](/docs/install) in your kubernetes cluster.

## Create a topic

Topics are a central concepts in Streams and represents a feed of messages. For a topic to be consumed by subscribers, it must first be associated with one [publisher](/docs/publishers/) in charge of publishing payloads.

In this example, we create a topic associated with a [HTTP Poller publisher](/docs/publishers/publisher-http-poller), which is responsible for polling a target URL and automatically publishing the content retrieved at the given polling period.

To create the topic, perform a request `POST /streams/hub/api/v1/topics` endpoint with following body:

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

The [HTTP Poller publisher](/docs/publishers/publisher-http-poller) starts to poll and publish the content retrieved from the target `url` as soon as the first subscriber connects to the topic. The polling is automatically stopped after the last subscriber has unsubscribed from the topic.

## Subscribe to the topic

Streams provide different event-driven [subscribers](/docs/subscribers) to allow any consumers to subscribe to a topic. In this example, we will use Streams [SSE subscriber](/docs/subscribers/subscriber-sse) by simply opening a terminal and running the following cURL command:

```sh
export BASE_URL="base-url"
export TOPIC_ID="topic-id"

curl "${BASE_URL}/streams/subscribers/sse/api/v1/topics/${TOPIC_ID}"
```

* `base-url` depends on your deployment configuration.
* `topic-id` is the unique identifier of the topic automatically assigned on creation.

If the connection is successfully established, Streams responds with a `200 OK` and send events through your first event-driven API.
