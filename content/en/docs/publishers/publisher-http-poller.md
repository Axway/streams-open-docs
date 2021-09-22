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

### http-poller publisher configuration

The http-poller publisher requires some specific configuration.

| Attribute                     | Mandatory | Default Value  | Description            |
| ----------------------------- | --------- | -------------- | ---------------------- |
| url                           | yes       | none           | Target URL to request  |
| pollingPeriod                 | no        | PT5S (5 sec)   | Period at witch the target URL will be requested. Min: PT0.5S Max: PT1H. Visit [ISO-8601 format](https://en.wikipedia.org/wiki/ISO_8601#Durations) for details. |
| headers                       | no        | none           | Map of key/value pairs that will be injected as HTTP headers when requesting the target URL |
| retryOnHttpCodes              | no        | 500,503,504    | A list of http codes which will trigger the retry. Others codes generate on error without any retry |
| retryMaxAttempts              | no        | 3              | The max number of retries in case of errors |
| retryBackOffInitialDuration   | no        | PT1S           | Period after which the first retry is attempt (ISO-8601 format).  Min = PT0S (0s) ; Max = PT10S (10s) |
| retryBackOffMaxDuration       | no        | PT10S          | Period max between two attempt (ISO-8601 format). Min = PT0S (0s) ; Max = PT60S (60s) |
| retryBackOffFactor            | no        | 0.5            | The factor used to determine the next retry duration |
| computedQueryParameters       | no        | none           | Map of [ComputedQueryParameters](/docs/publishers/publisher-http-poller/#computed-query-parameters) that will be injected as query parameters. The key which is the *query param name* must use URL-safe characters, see [Unreserved Characters](https://datatracker.ietf.org/doc/html/rfc2396#section-2.3) section of RFC-2396 for more information.

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
            "CustomHeader2": "value1,value2"
        },
        "retryOnHttpCodes": [500,503,504],
        "retryMaxAttempts": 3,
        "retryBackOffInitialDuration": "PT1S",
        "retryBackOffMaxDuration": "PT10S",
        "retryBackOffFactor": 0.5,
        "computedQueryParameters": {
            "computedQueryParam1": {
              "type": "date-time",
              "reference": "last-success",
              "pattern": "yyyy-MM-dd'T'HH:mm:ss"
            },
            "computedQueryParam2": {
              "type": "timestamp",
              "reference": "last-success",
              "useMilliseconds": true
            }
        }
    }
  }
}
```

### Computed Query Parameters

Computed Query Parameters are query parameters injected to the target URL at each polling. They are based on a given *reference*.

| Attribute  | Mandatory | Default Value  | Description            |
| ---------- | --------- | ------ | ---------------------- |
| reference  | yes       | last-success | define the reference of the computed query param |

The available references are:

* **last-success** : Instant corresponding to the last successful request execution

#### DateTime format

Format the reference value as a dateTime using given pattern. It must follow the [Java DateTimeFormatter Pattern](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/time/format/DateTimeFormatter.html#patterns)

| Attribute  | Mandatory | Default Value  | Description  |
| ------------ | -------------------- | --------------- | --------- |
| type         | yes | date-time     | Reference will be formatted in a *dateTime* format |
| pattern      | no  | yyyy-MM-dd'T'HH:mm:ssXXX | Pattern used to format the reference   |

**Example:**

To dynamically add a `from` query parameter to the target URL based on the **last-success** reference with the following format `yyyy-MM-dd'T'HH:mm:ss` add the following computedQueryParameters config:

```json
{
  "name": "myHttpPollerTopic",
  "publisher": {
    "type": "http-poller",
    "config": {
        "url": "https://myserver/my-api",
        "computedQueryParameters": {
            "from": {
              "type": "date-time",
              "reference": "last-success",
              "pattern": "yyyy-MM-dd'T'HH:mm:ss"
            }
        }
    }
  }
}
```

The resulting target URL polled will look like this: `https://myserver/my-api?from=2021-09-22T09:56:09`

#### Timestamp format

Format the reference value as a timestamp.

| Attribute       | Mandatory | Default Value  | Description  |
| ------------    | -------------------- | --------------- | --------- |
| type            | yes | timestamp     | Reference will be formatted as a *timestamp* |
| useMilliseconds | no  | false | If true, timestamp will be in milliseconds, otherwise in seconds   |

**Example:**

To add a `from` query parameter to the target URL based on the **last-success** reference as a timestamp add the following computedQueryParameters config:

```json
{
  "name": "myHttpPollerTopic",
  "publisher": {
    "type": "http-poller",
    "config": {
        "url": "https://myserver/my-api",
        "computedQueryParameters": {
            "from": {
              "type": "timestamp",
              "reference": "last-success"
            }
        }
    }
  }
}
```

The resulting target URL will look like this: `https://myserver/my-api?from=1632304569`

### Removing http headers from configuration

To remove a header from publisher's configuration, set its value to `null` when calling `PATCH /streams/hub/api/v1/topics/{{topicId}}` endpoint:

```json
{
  "publisher": {
    "config": {
        "headers": {
            "CustomHeader": null,
        }
    }
  }
}
```
