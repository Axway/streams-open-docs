---
title: HTTP Post Publisher
linkTitle: HTTP Post Publisher
weight: 2
date: 2019-04-02
description: Learn how to configure a topic associated to an HTTP Post publisher.
---

## HTTP Post Publisher

The HTTP Post publisher allows any external component (device, sensor, application, micro-service, etc.) capable of performing an HTTP request to publish payloads in a Streams topic.
Streams will then take care of storing and forwarding events to the subscribers.

### http-post publisher configuration

To create a Streams topic associated to a http-post publisher, you must perform a request on `POST /streams/hub/api/v1/topics` endpoint.

The http-post publisher does not require any specific configuration. Since the config attribute is mandatory, it must be provided with and empty object:

```json
{
  "name": "myHttpPostTopic",
  "publisher": {
    "type": "http-post",
    "config": {}
  }
}
```

### Publishing with http-post publisher

Once the topic is created, the external component can publish payloads using the following endpoint:

`POST /streams/publishers/http-post/api/v1/topics/{{topicId}}`

Note that only `application/json` content is accepted. Below is an example of a valid json payload:

```json
{
  "object": {
    "a": "b",
    "c": "d",
    "e": "f"
  },
  "array": [
    1,
    2
  ],
  "string": "Hello World"
}
```

### http-post publisher status codes

Below the list of HTTP status codes that can be returned when trying to publish:

| Code | Description |
|------|-------------|
| 202 Accepted | Indicates that the publication request is valid and have been accepted. Note: Streams platform will make its best effort (retries) to deliver the published content to all subscribers. As publication is an asynchronous process, the 202 Accepted response does not provide a guarantee that the published content will be delivered to all subscribers. |
| 404 Not found | Indicates that the requested URL does not exists. |
| 405 Method Not Allowed | Indicates that the method used by Publisher is not allowed. Only POST verb is supported. |
|  406 Not Acceptable | Indicates that the server cannot produce a response matching the list of acceptable values defined in the request's content negotiation headers. Only application/json is supported. |
| 410 Gone | Indicates that the topic to which publisher is trying to publish is no longer available because of the following reasons: (1) The topic is configured with the alwaysOn option set to false and no subscriber is currently subscribed to the topic. As the number of subscribers can vary over time, we recommend to implement an exponential back off strategy but not to stop publication permanently. (2) The topic has been permanently deleted. In order to verify that a topic still exists or has been permanently deleted, you can request `GET /streams/hub/api/v1/topics` endpoint. |
| 413 Request Entity Too Large | Indicates that the server refuses to accept the request because the payload size is beyond 1MB, which is the limit for Streams.|
| 415 Unsupported Media Type | Indicates that the server refuses to accept the request because the payload format defined in the publish request is in an unsupported format. Only application/json is supported. |

Besides those specific errors, you can also receive any of the [generic Streams API errors](/docs/topics-api/#error-codes).