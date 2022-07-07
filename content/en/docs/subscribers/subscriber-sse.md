---
title: SSE Subscriber
linkTitle: SSE Subscriber
weight: 2
date: 2019-04-02
description: Learn how to configure and use the Streams server-sent events subscriber.
---

Server-sent events (SSE) is part of the HTML5 standard. SSEs are sent over traditional HTTP, so they do not require a special protocol to work. SSE includes important features, such as `Last-Event-Id` header support, automatic client reconnection, and heterogeneous event handling.

## Subscribe to a topic via SSE with provisioning

Use this mode when you want to control how a Streams topic is consumed.

### Provision a SSE subscription

You can create a SSE subscription by making an HTTP post request on the following endpoint:

```
POST /streams/subscribers/sse/api/v1/topics/{topicID}/subscriptions
```

The request body must contain a JSON SSE subscription configuration as following:

```json
{
    "subscriptionMode": "snapshot-only"
}
```

| Configuration entry | Mandatory | Default value | Description |
|---------------------|-----------|---------------|-------------|
| subscriptionMode | no | Default subscription mode defined in the topic's configuration | For more information, see section [subscription modes](/docs/subscribers/#subscription-modes). |

After the SSE subscription is successfully created, you can consume it with a `subscribe` request.

### Consume the SSE subscription

Open a terminal and run the following cURL command:

```sh
export BASE_URL="base-url"
export SUBSCRIPTION_ID="subscription-id"

curl -v "${BASE_URL}/streams/subscribers/sse/api/v1/subscriptions/${SUBSCRIPTION_ID}/subscribe"
```

`subscription-id` is the unique identifier of the provisioned subscription you wish to use.

If the connection is successfully established, Streams returns `200 OK` and _Content-Type: text/event-stream_ responses.

{{< alert title="Caution" color="warning">}}If [Subscriber SSE security](/docs/install/customize-install/#activate-subscriber-sse-security) feature is activated, an access token will be required to consume a SSE subscription. See section [Validate Streams Subscribers SSE API](/docs/install/apim-integration/#validate-streams-subscribers-sse-api) for more information.{{< /alert >}}

## Subscribe to a topic via SSE without provisioning

Use this mode when you need to specify the subscription mode. An automatic provision will be done with a disposable SSE subscription (deleted after the SSE channel disconnection) configured with the desired subscription mode.

{{< alert title="Caution" color="warning">}}Subscribing to a topic without provisioning is not allowed if [Subscriber SSE security](/docs/install/customize-install/#activate-subscriber-sse-security) feature is activated during the installation.{{< /alert >}}

To subscribe to a topic, open a terminal and run the following cURL command:

```sh
export BASE_URL="base-url"
export TOPIC_ID="topic-id"

curl -v "${BASE_URL}/streams/subscribers/sse/api/v1/topics/${TOPIC_ID}"
```

`topic-id` is the unique identifier of the topic you want to subscribe to.

If the connection is successfully established, Streams returns `200 OK` and _Content-Type: text/event-stream_ responses.

When the SSE channel is stopped by the user, the subscription configuration is automatically deleted.

### Select a subscription mode

You can select the subscription mode by setting the `Accept` header in its subscription request:

| Subscription Mode | Accept Header Value |
|-------------------|---------------------|
| snapshot-only | `application/vnd.axway.streams+snapshot-only` |
| snapshot-patch | `application/vnd.axway.streams+snapshot-patch` |
| event | `application/vnd.axway.streams+event` |
| default | `""` or  `*/*` or `text/event-stream` |

If the client requests a subscription mode not allowed by the configuration of the topic, a `406 Not Acceptable` error is returned. For more information, see [subscription modes](/docs/subscribers/#subscription-modes) and [subscription errors](/docs/subscribers/subscribers-errors/).

## How SSE connection works

After you connect to an SSE server, you receive an HTTP `200 OK` response and the connection remains alive - as long as the client, or the server, does not end it, and all events related to the subscription continue to be processed afterwards, including errors (for example, authentication errors, bad requests, and son on).

SSE is a text-based protocol. The following is an example of the response of the server after the connection is successfully established and a first message has been published:

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
| event | Define the type of the event. Refer to [type of events](#type-of-events) section
| data | Refer to [subscription modes](/docs/subscribers/#subscription-modes) section |

{{< alert title="Note" >}}`id`, `event`and `data` fields are always present and represent a single message, also called `event`.{{< /alert >}}

## Compress an SSE

You can compress SSE on demand by using Gzip or deflate methods. The following is an example of how to use the `Accept-Encoding` header:

```sh
export BASE_URL="base-url"

# With a provisioned subscription
export SUBSCRIPTION_ID="subscription-id"
curl -v "${BASE_URL}/streams/subscribers/sse/api/v1/subscriptions/${SUBSCRIPTION_ID}/subscribe" -H "Accept-Encoding: gzip, deflate" --compress

# Without provisioned subscription
export TOPIC_ID="topic-id"
curl -v "${BASE_URL}/streams/subscribers/sse/api/v1/topics/${TOPIC_ID}" -H "Accept-Encoding: gzip, deflate" --compress
```

If this header is not provided, the default behavior is not to compress the data.

## Reconnect automatically after an interruption

SSE has the ability for clients to automatically reconnect if the connection is interrupted. Furthermore, the data stream continues from the point it disconnected, so no events are lost.

Each message sent by Streams is uniquely identified. Using the built-in header `Last-Event-Id` after reconnecting, the client can tell Streams where in the events streams to resume. This mechanism is automatically integrated in most clients, but you can also achieve it by running the following curl command:

```sh
export BASE_URL="base-url"

# With a provisioned subscription
export SUBSCRIPTION_ID="subscription-id"
curl -v "${BASE_URL}/streams/subscribers/sse/api/v1/subscriptions/${SUBSCRIPTION_ID}/subscribe" -H "Last-Event-Id: 00ae73f5-5349-40c4-91b6-2e58a36b5365#1"

# Without provisioned subscription
export TOPIC_ID="topic-id"
curl -v "${BASE_URL}/streams/subscribers/sse/api/v1/topics/${TOPIC_ID}" -H "Last-Event-Id: 00ae73f5-5349-40c4-91b6-2e58a36b5365#1"
```

## Connection heartbeat

In certain cases, some legacy network infrastructure may drop HTTP connections after a short timeout. To protect against such behaviors, Streams sends the client a comment line (starting with a ':' character) every 5 seconds. This comment line is ignored by the SSE client and has no effect other than a very limited network consumption.

When no change is detected by Streams, the subscribers get those heartbeats repeatedly until an event is finally sent.

## Deactivate a SSE subscription

To deactivate a SSE subscription, simply set to `suspended` its status with following request:

```
PATCH /streams/subscribers/sse/api/v1/subscriptions/{subscriptionId}
```

The body must contain a JSON with the suspended status as the following example:

```json
{
    "subscriptionStatus": "suspended"
}
```

### Deactivation status codes

The following table shows HTTP status codes that can be returned when deleting the webhook subscription:

| Code          | Comment |
|---------------|---------|
| 200 Ok        | Indicates that the subscription has been successfully suspended.
| 404 Not found | Indicates that the provided identifier does not correspond to an existing SSE subscription.

When the subscription has `suspended` status, it can no longer be used to open an SSE channel and if an SSE channel was already open it will be closed. To reactivate it, follow the same procedure with `active` value, instead of `suspended`.

## Delete a SSE subscription

To delete an existing SSE subscription, simply delete the corresponding SSE subscription using the following request:

```
DELETE /streams/subscribers/sse/api/v1/subscriptions/{subscriptionId}
```

### Delete status codes

The following table shows HTTP status codes that can be returned when deleting the SSE subscription:

| Code | Comment |
|------|---------|
| 204 No Content | Indicates that the subscription has been successfully deleted.
| 404 Not found | Indicates that the provided identifier does not correspond to an existing SSE subscription.

## Get a SSE subscription

To get an existing subscription, use the following GET request:

```
GET /streams/subscribers/sse/api/v1/subscriptions/{subscriptionId}
```

### Get status codes

The following table shows HTTP status codes that can be returned when trying to get a SSE subscription:

| Code | Comment |
|------|---------|
| 200 Ok | Indicates that the subscription requested is valid and has been retrieved. |
| 404 Not found | Indicates that the requested URL or subscription requested does not exist. |

## Get SSE subscriptions for a topic

To get existing subscriptions (disposable subscriptions included), use the following GET request on your topic:

```
GET /streams/subscribers/sse/api/v1/topics/{topicId}/subscriptions
```

The only field name allowed for sorting is **subscriptionMode**.

For more information on how pagination and sorting work, see [Pagination](/docs/topics-api/#pagination).
