---
title: HTTP poller publisher
linkTitle: HTTP poller publisher
weight: 1
date: 2019-04-02
description: Learn how to configure a topic associated to a HTTP poller publisher.
---

Polling describes the mechanism used to retrieve data from an API - the client first needs to send a request to a server and the server responds by sending the requested data.

Because it is not possible for the client to know when the data is updated, it usually sends requests as often as possible to try to stick to reality and ends up using a lot of bandwidth and resources to receive the same data several times.

Streams provides the ability to instantly turns any request/response API into a real-time event-driven data feed, the HTTP poller publisher will poll the target URL at the given period and publish the content in the associated topic.

Streams will then fan out the content (snapshot, computed patches) to all subscribed client as soon as a change is detected in the response of the target URL.

## Understand HTTP poller publisher configuration

The http-poller publisher requires some specific configuration.

| Attribute                     | Mandatory | Default Value  | Description            |
| ----------------------------- | --------- | -------------- | ---------------------- |
| url                           | yes       | none           | Target URL to request.  |
| pollingPeriod                 | no        | PT5S (5 sec)   | Period at witch the target URL will be requested. Min: PT0.5S, Max: PT1H. For more information, see [ISO-8601](https://en.wikipedia.org/wiki/ISO_8601#Durations) format. |
| headers                       | no        | none           | Map of key/value pairs that will be injected as HTTP headers when requesting the target URL. |
| retryOnHttpCodes              | no        | 500,503,504    | A list of HTTP codes, which will trigger the retry. Others codes generate on error without any retry. |
| retryMaxAttempts              | no        | 3              | The maximum number of retries in case of errors. |
| retryBackOffInitialDuration   | no        | PT1S           | Period after which the first retry is attempted (ISO-8601 format). Min = PT0S (0s), Max = PT10S (10s). |
| retryBackOffMaxDuration       | no        | PT10S          | Maximum period between two attempts (ISO-8601 format). Min = PT0S (0s), Max = PT60S (60s). |
| retryBackOffFactor            | no        | 0.5            | The factor used to determine the next retry duration. |
| computedQueryParameters       | no        | none           | Map of [ComputedQueryParameters](/docs/publishers/publisher-http-poller/#computed-query-parameters) that will be injected as query parameters. The key, *query parameter name*, must use URL-safe characters. For more information, see [Unreserved Characters](https://datatracker.ietf.org/doc/html/rfc2396#section-2.3).

The following is an example of an HTTP poller publisher:

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

## Computed query parameters

Computed query parameters are query parameters injected to the target URL at each polling. They are based on a given *reference*.

| Attribute  | Mandatory | Default Value  | Description            |
| ---------- | --------- | ------       | ---------------------- |
| reference  | yes       | last-success | Defines the reference of the computed query parameter. |

The available references are:

* **last-success** : Instant corresponding to the last successful request execution.

### DateTime format

Format the reference value as DateTime. This must follow the [Java DateTimeFormatter](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/time/format/DateTimeFormatter.html#patterns) pattern.

| Attribute  | Mandatory | Default Value      | Description  |
| ------------ | --------------------         | --------------- | --------- |
| type         | yes | date-time              | The reference is formatted in a DateTime format. |
| pattern      | no  | yyyy-MM-dd'T'HH:mm:ssXXX | Pattern used to format the reference.   |

The following is an example of how to dynamically add a `from` query parameter to the target URL based on the **last-success** reference with the following format `yyyy-MM-dd'T'HH:mm:ss`, by using the `computedQueryParameters` attribute:

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
| type            | yes | timestamp     | The reference is formatted as a Timestamp. |
| useMilliseconds | no  | false | If true, the time stamp is measured in milliseconds, otherwise in seconds.   |

The following is an example of how to add a `from` query parameter to the target URL based on the **last-success** reference as a Timestamp, by using the `computedQueryParameters` attribute:

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

### Remove HTTP headers from configuration

To remove a header from the configuration of the  publisher, set the header value to `null` when calling the `PATCH /streams/hub/api/v1/topics/{{topicId}}` endpoint. For example:

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
