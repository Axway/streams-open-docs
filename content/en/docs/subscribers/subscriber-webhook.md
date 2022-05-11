---
title: Webhook Subscriber
linkTitle: Webhook Subscriber
weight: 3
date: 2019-04-02T00:00:00.000Z
description: Learn how to configure and use the Streams Webhook Subscriber.
---

Streams Webhook subscriber allows clients to be notified via HTTP Post requests made by Streams to the endpoint provided during their subscription.

## Create a Webhook subscription

You can create a webhook subscription by making an HTTP Post request on the following endpoint:

```
POST /streams/subscribers/webhook/api/v1/topics/{topicID}/subscriptions
```

The request body must contain a JSON webhook subscription configuration as the following example:

```json
{
    "webhookUrl": "https://valid.url/of/webhook",
    "webhookHeaders": {
      "additionalHeader": "value"
    },
    "subscriptionMode": "snapshot-only",
    "authorization": {
        "type": "oauth2",
        "clientId": "myclientId",
        "clientSecret": "myclientSecret",
        "provider": "http://authorization.com/oauth/token",
        "scope": "READ,WRITE",
        "mode": "body"
    }
}
```

| Configuration Entry | Mandatory | Default value | Description |
|---------------------|-----------|---------------|-------------|
| webhookUrl | yes | n/a | URL which will be called by Streams in order to inform the subscriber that a new event/message has been published in the topic identified by `{topicId}`. |
| webhookHeaders | no | n/a | Map of key/value which will send by Streams to the subscriber. |
| subscriptionMode | no | Default subscription mode defined in the topic's configuration | For more information, see section [subscription modes](/docs/subscribers/#subscription-modes). |
| authorization | no | n/a | OAuth2 Authorization configuration. For more information, see section [OAuth2 Authorization](#authorization-with-oauth-2-0). |

After the webhook subscription is successfully created, Streams starts notifying the subscriber at the specified `webhookUrl`.

### Connect to a webhook protected by Oauth 2.0

The webhook subscriber can post data to an API that is secured with [OAuth2](https://datatracker.ietf.org/doc/html/rfc6749) protocol. Because the Webhook subscriber authenticates to the authorization server without any end-user interaction, the only OAuth2 authorization grant type supported is the [client credentials](https://datatracker.ietf.org/doc/html/rfc6749#section-4.4).

The OAuth2 authorization workflow is implemented with the following limitations:

* The OAuth2 authorization workflow is initiated on the authorization server URL for the first polling, and the retrieved access token is reused for following requests until it expires.
* Refresh token mechanism is not implemented.
* Only access token of type [Bearer](https://datatracker.ietf.org/doc/html/rfc6749#section-7.1) is supported.
* The authorization request is made via a `POST` method on the authorization server, and the client credentials are sent either via `header` or `body`.

The following table lists the OAuth2 authorization configuration:

| Attribute                     | Mandatory | Default value  | Description            |
| ----------------------------- | --------- | -------------- | ---------------------- |
| type                          | yes       | none           | Type of authorization protocol configured on the API. Currently, only `oauth2` is supported. |
| clientId                      | yes       | none           | The client identifier issued during the registration process.  |
| clientSecret                  | yes       | none           | The client secret issued during the registration process.  |
| provider                      | yes       | none           | Target URL of the authorization server. |
| mode                          | yes       | header         | Whether to send [client authentication](https://datatracker.ietf.org/doc/html/rfc6749#section-2.3.1) via `body` or a basic authorization `header`. |
| scope                         | no        | none           | A [scope](https://datatracker.ietf.org/doc/html/rfc6749#section-3.3) request parameter. |

The following is an example of how to implement OAuth authorization:

```json
{
  "webhookUrl": "https://valid.url/of/webhook",
  "subscriptionMode": "snapshot-only",
  "authorization": {
    "type": "oauth2",
    "clientId": "myclientId",
    "clientSecret": "myclientSecret",
    "provider": "http://authorization.com/oauth/token",
    "scope": "READ,WRITE",
    "mode": "body"
  }
}
```

### Create status codes

Below the list of HTTP status codes that can be returned when trying to create a webhook subscription:

| Code | Comment |
|------|---------|
| 201 Created | Indicates that the subscription request is valid and has been created. |
| 400 Bad Request | Indicates that the provided data are invalid. |
| 404 Not found | Indicates that the requested URL does not exist. |

## Stop a webhook subscription

To stop the sending of webhook notifications, simply delete the corresponding webhook subscription with following request:

```
DELETE /streams/subscribers/webhook/api/v1/subscriptions/{subscriptionId}
```

### Delete status codes

Below the list of HTTP status codes that can be returned when deleting the webhook subscription

| Code | Comment |
|------|---------|
| 204 No Content | Indicates that the subscription has been successfully deleted.
| 404 Not found | Indicates that the provided identifier does not correspond to an existing webhook subscription.

## Get a webhook subscription

To get an existing subscription, use the following GET request:

```
GET /streams/subscribers/webhook/api/v1/subscriptions/{subscriptionId}
```

### Get status codes

Below the list of HTTP status codes that can be returned when trying to get a webhook subscription:

| Code | Comment |
|------|---------|
| 200 Ok | Indicates that the subscription requested is valid and has been retrieved. |
| 404 Not found | Indicates that the requested URL or subscription requested does not exist. |

## Test a webhook subscription

You can test a webhook subscription by making an HTTP Post request on the following endpoint:

```
POST /streams/subscribers/webhook/api/v1/subscriptions/{subscriptionId}/test
```

The request body can contain any JSON object and will be sent as is to the identified subscription.

### Test status codes

The following HTTP status codes can be returned while testing a webhook subscription:

| Code | Comment |
|------|---------|
| 202 Accepted | Indicates that the payload has been successufuly sent to the subscription. |
| 400 Bad Request | Indicates that the provided data are invalid. |
| 404 Not found | Indicates that the requested URL does not exist. |

## Get the webhook notification history for a subscription

Use the following `GET` request to retrieve the history of webhook exchanges (requests and responses) that have occurred for a subscription in the last 5 minutes:

```
GET /streams/subscribers/webhook/api/v1/subscriptions/{subscriptionId}/exchanges
```

You can change the default time window of the retrieved history with `start` and `end` query params (date-time in ISO 8601 format, eg: 2021-01-10T10:13:32Z):

```
GET /streams/subscribers/webhook/api/v1/subscriptions/{subscriptionId}/exchanges?start=2021-01-10T10:13:30Z&end=2021-01-10T10:13:32Z
```

### Webhook exchanges status codes

The following HTTP status codes can be returned when interacting with the exchanges history:

| Code | Comment |
|------|---------|
| 200 Ok | Indicates that the exchanges history requested is valid and has been retrieved. |
| 400 Bad Request | Indicates that the request is invalid. |

#### Webhook exchange samples

```json
[{
  "subscriptionId": "9794665d-a566-40a6-9113-8f345ed90eb5",
  "pipelineId": "3c83d607-f42f-4438-b4b1-b4856eb4dc4a",
  "eventType": "snapshot",
  "requestDatetime": "2021-01-18T10:13:32.127711Z",
  "requestDuration": "PT0.153501S",
  "requestUrl": "https://valid.url/of/webhook",
  "responseCode": 200,
  "responseHeaders": {
    "Access-Control-Allow-Origin": "*",
    "Connection": "keep-alive",
    "Content-Type": "application/json; charset=utf-8"
  },
  "responseBody": "{ \"success\": \"ok\" }",
  "responseSize": "19B"
},{
  "subscriptionId": "9794665d-a566-40a6-9113-8f345ed90eb5",
  "pipelineId": "941253bd-1551-4a22-9988-4e54b0de9c14",
  "eventType": "snapshot",
  "requestDatetime": "2021-01-18T16:25:05.547734Z",
  "requestDuration": "PT0.195613S",
  "requestUrl": "https://valid.url/wrong/path",
  "requestHeaders": {},
  "responseCode": 404,
  "errorMessage": "404 NOT_FOUND"
},{
  "subscriptionId": "9794665d-a566-40a6-9113-8f345ed90eb5",
  "pipelineId": "941253bd-1551-4a22-9988-4e54b0de9c14",
  "eventType": "snapshot",
  "requestDatetime": "2021-01-18T16:25:05.743574Z",
  "requestDuration": "PT0.195613S",
  "requestRetryAttempts": 1,
  "requestRetryMaxAttempts": 1,
  "requestUrl": "https://valid.url/wrong/path",
  "requestHeaders": {},
  "responseCode": 404,
  "errorMessage": "404 NOT_FOUND"
}]
```

## Get webhook subscriptions for a topic

To get existing subscriptions, use the following GET request on your topic:

```
GET /streams/subscribers/webhook/api/v1/topics/{topicId}/subscriptions
```

For more information on how pagination and sorting work, see [Pagination](/docs/topics-api/#pagination).

The field names allowed for sorting are :

* subscriptionMode
* webhookUrl

## Webhook event

As soon as the publisher starts to publish data, the webhook subscribers start to receive the events via webhook callbacks.

The webhook call is an HTTP POST request that contains two types of data: headers and a payload.

### Headers

| Header name | Description |
|-------------|-------------|
| X-Axway-Streams-Subscription-Id | Unique identifier of the webhook subscription. |
| X-Axway-Streams-Topic-Id | Identifier of the topic to which the subscription belongs. |
| X-Axway-Streams-Event-Id | Identifier of the event. |
| X-Axway-Streams-Event-Type | Type of the payload (snapshot, patch or error). |
| Webhook Event Payload | See [Webhook payload samples](#webhook-payload-samples). |

#### Payload

Fore more information, see [Subscription modes](/docs/subscribers/#subscription-modes) and [Subscription error](/docs/subscribers/subscribers-errors/).
