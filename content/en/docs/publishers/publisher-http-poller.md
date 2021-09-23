---
title: HTTP Poller Publisher
linkTitle: HTTP Poller Publisher
weight: 1
date: 2019-04-02
description: Learn how to configure a topic associated to a HTTP Poller publisher.
---

## HTTP Poller Publisher

Polling describes the mechanism used to retrieve data from an API: the client first needs to send a request to a server and the server responds by sending the requested data.
Since it is not possible for the client to know when the data is updated, it usually sends requests as often as possible to try to stick to reality and ends up using a lot of bandwidth and resources to receive the same data several times.
Streams provides the ability to instantly turns any request/response API into a real-time event-driven data feed: The HTTP poller publisher will poll the target URL at the given period and publish the content in the associated topic.
Streams will then fan out the content (snapshot, computed patches) to all subscribed client as soon as a change is detected in the response of the target URL.

### OAuth 2.0 support

The HTTP Poller Publisher is able to fetch data from an API that is secured with [OAuth2 protocol](https://datatracker.ietf.org/doc/html/rfc6749).
As The HTTP Poller publisher will authenticate to the authorization server without any end-user interaction, the OAuth2 authorization grant type supported is [client credentials](https://datatracker.ietf.org/doc/html/rfc6749#section-4.4).
The HTTP Poller publisher is able to initiate an OAuth2 authorization workflow with the following capabilities:

* The HTTP Poller publisher initiates an OAuth2 authorization workflow on the authorization server url on every polling. Refresh token mechanism is not implemented.
* The HTTP Poller publisher is able to manage access token of type [Bearer](https://datatracker.ietf.org/doc/html/rfc6749#section-7.1)
* The HTTP Poller publisher makes his authorization request via a `POST` method on the authorization server. Client password are sent either via `header` or `body`

### http-poller publisher configuration

The http-poller publisher requires some specific configuration.

| Attribute                     | Mandatory | Default Value  | Description            |
| ----------------------------- | --------- | -------------- | ---------------------- |
| url                           | yes       | none           | Target URL to request  |
| pollingPeriod                 | no        | PT5S (5 sec)   | Period at witch the target URL will be requested. Min: PT0.5S Max: PT1H. Visit [ISO-8601 format](https://en.wikipedia.org/wiki/ISO_8601#Durations) for details. |
| headers                       | no        | none           | Map of key/value pairs that will be injected as HTTP headers when requesting the target URL |
| authorization.type            | yes       | none           | Type of authorization protocol configured on the API. Currently only `oauth2` is supported, refer to [OAuth2 Support](/docs/publishers/publisher-http-poller/#oauth-2-0-support) |
| clientId                      | yes       | none           | The client identifier issued during the registration process  |
| clientSecret                  | yes       | none           | The client secret issued during the registration process  |
| provider                      | yes       | none           | Target URL of the authorization server |
| mode                          | yes       | header         | Whether to send [client password](https://datatracker.ietf.org/doc/html/rfc6749#section-2.3.1) via body or basic authorization header |
| scope                         | no        | none           | [scope](https://datatracker.ietf.org/doc/html/rfc6749#section-3.3) request parameter |
| retryOnHttpCodes              | no        | 500,503,504    | A list of http codes which will trigger the retry. Others codes generate on error without any retry |
| retryMaxAttempts              | no        | 3              | The max number of retries in case of errors |
| retryBackOffInitialDuration   | no        | PT1S           | Period after which the first retry is attempt (ISO-8601 format).  Min = PT0S (0s) ; Max = PT10S (10s) |
| retryBackOffMaxDuration       | no        | PT10S          | Period max between two attempt (ISO-8601 format). Min = PT0S (0s) ; Max = PT60S (60s) |
| retryBackOffFactor            | no        | 0.5            | The factor used to determine the next retry duration |

```json
{
  "name": "myHttpPollerTopic",
  "publisher": {
    "type": "http-poller",
    "config": {
        "url": "target URL",
        "pollingPeriod": "PT5S",
        "headers": {
            "CustomHeader": "value",
            "CustomHeader2": "value1,value2",
            ...
        },
        "authorization": {
          "type": "oauth2",
          "clientId": "myclientId",
          "clientSecret": "myclientSecret",
          "provider": "http://authorization.com/oauth/token",
          "scope": "READ,WRITE",
          "mode": "header|body"
        },
        "retryOnHttpCodes": [500,503,504],
        "retryMaxAttempts": 3,
        "retryBackOffInitialDuration": "PT1S",
        "retryBackOffMaxDuration": "PT10S",
        "retryBackOffFactor": 0.5
    }
  }
}
```

### Removing http headers from configuration

To remove a header from publisher's configuration, set its value to `null` when calling `PATCH /streams/hub/api/v1/topics/{{topicId}}` endpoint:

```json
{
  "publisher": {
    "config": {
        "headers": {
            "CustomHeader": null
        }
    }
  }
}
```
