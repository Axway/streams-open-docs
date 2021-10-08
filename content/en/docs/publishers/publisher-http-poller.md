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
| url                           | yes       | N/A            | Target URL to request  |
| pollingPeriod                 | no        | PT5S (5 sec)   | Period at witch the target URL will be requested. Min: PT0.5S Max: PT1H. Visit [ISO-8601 format](https://en.wikipedia.org/wiki/ISO_8601#Durations) for details. |
| payloadPointer                | no        | N/A            | Define a json pointer to an attribute. See [RFC6901](https://datatracker.ietf.org/doc/html/rfc6901). |
| headers                       | no        | N/A            | Map of key/value pairs that will be injected as HTTP headers when requesting the target URL |
| retryOnHttpCodes              | no        | 500,503,504    | A list of http codes which will trigger the retry. Others codes generate on error without any retry |
| retryMaxAttempts              | no        | 3              | The max number of retries in case of errors |
| retryBackOffInitialDuration   | no        | PT1S           | Period after which the first retry is attempt (ISO-8601 format).  Min = PT0S (0s) ; Max = PT10S (10s) |
| retryBackOffMaxDuration       | no        | PT10S          | Period max between two attempt (ISO-8601 format). Min = PT0S (0s) ; Max = PT60S (60s) |
| retryBackOffFactor            | no        | 0.5            | The factor used to determine the next retry duration |
| computedQueryParameters       | no        | none           | Map of [ComputedQueryParameters](/docs/publishers/publisher-http-poller/#computed-query-parameters) that will be injected as query parameters. The key, *query parameter name*, must use URL-safe characters. For more information, see [Unreserved Characters](https://datatracker.ietf.org/doc/html/rfc2396#section-2.3). |
| pagination                    | no        | N/A            | Pagination mechanism configuration, see section [Pagination](#pagination) |

The following is an example of an HTTP poller publisher:

```json
{
  "name": "myHttpPollerTopic",
  "publisher": {
    "type": "http-poller",
    "config": {
        "url": "target URL",
        "pollingPeriod": "PT5S",
        "payloadPointer": "/items",
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
        },
        "pagination" : {
          "mode": "page",
          "page" : {
              "parameterName": "page",
              "initial": 1
          },
          "pageSize" : {
              "parameterName": "pageSize",
              "value": 1
          },
          "nextReference" : {
              "location": "body",
              "type" : "uri",
              "pointer" : "/links/next"
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

## Pagination

Pagination section allows to define how to paginate through your url when it is using pagination mechanism.

Different kind of pagination are supported:

* [Page](#page)
* [Offset](#offset)

### Page

The set of items is divided into pages. The endpoint accepts a _page_ param that is an integer indicating the page within the list to be returned, and _pageSize_ param that is an integer indicating the number of items per page, for example _/items?page=2&pageSize=10_.

| Attribute                     | Mandatory | Default Value  | Description                                                                             |
| ----------------------------- | --------- | -------------- | ----------------------                                                                  |
| mode                          | yes       | page           | Define the page mode to use                                                             |
| page.parameterName            | no        | page           | Parameter used for the page index                                                       |
| page.initial                  | no        | 1              | Initial value of the first page, must equal or be higher than 0                         |
| pageSize.parameterName        | no        | pageSize       | Parameter used for the number of elements per page                                      |
| pageSize.value                | no        | 100            | Define the number of items per page, must be higher than 0                              |
| nextReference.location             | yes       | N/A            | Either *body* or *header*. See section [Next reference](#next-reference).                                                            |
| nextReference.type                 | yes       | N/A            | Only if location is *body*. Define the type of next reference                           |
| nextReference.pointer              | yes       | N/A            | Only if location is *body*. Json pointer to the attribute containing the next reference. See [RFC6901](https://datatracker.ietf.org/doc/html/rfc6901). |

```json
{
  "name": "topic-with-page-mode",
  "publisher": {
    "type": "http-poller",
    "config": {
      "url": "http://my-host/api",
      "pagination" : {
        "mode": "page",
        "page" : {
            "parameterName": "page",
            "initial": 1
        },
        "pageSize" : {
            "parameterName": "pageSize",
            "value": 100
        },
        "nextReference" : {
            "location": "body",
            "type" : "uri",
            "pointer" : "/links/next"
        }
      }
    }
  }
}

```

### Offset

Offset mode is very similar approach to page mode but uses different parameters _offset_ and _limit_. _offset_ tells the server the number of items that should be skipped, while _limit_ indicates the number of items to be returned, for example _/items?offset=10&limit=10_.

| Attribute                     | Mandatory | Default Value  | Description                                                                             |
| ----------------------------- | --------- | -------------- | ----------------------                                                                  |
| mode                          | yes       | offset         | Define the page mode to use                                                             |
| offset.parameterName          | no        | offset         | Parameter used for the page index                                                       |
| offset.initial                | no        | 1              | Initial value of the first page, must equal or be higher than 0                         |
| limit.parameterName           | no        | limit          | Parameter used for the number of elements per page                                      |
| limit.value                   | no        | 100            | Define the number of items per page, must be higher than 0                              |
| nextReference.location           | yes       | N/A            | Either *body* or *header*. See section [Next reference](#next-reference).                                                           |
| nextReference.type               | yes       | N/A            | Only if location is *body*. Define the type of next reference                           |
| nextReference.pointer            | yes       | N/A            | Only if location is *body*. Json pointer to the attribute containing the next reference. See [RFC6901](https://datatracker.ietf.org/doc/html/rfc6901). |

```json
{
  "name": "topic-with-page-mode",
  "publisher": {
    "type": "http-poller",
    "config": {
      "url": "http://my-host/api",
      "pagination" : {
        "mode": "offset",
        "offset" : {
            "parameterName": "offset",
            "initial": 1
        },
        "limit" : {
            "parameterName": "limit",
            "value": 100
        },
        "nextReference" : {
            "location": "body",
            "type" : "uri",
            "pointer" : "/links/next"
        }
      }
    }
  }
}
```

### Next reference

You can define two way to retrieve next reference location, independently on the pagination mode choosen. Either the next reference is in the _body_ of the first response, or in the header _Link_.

#### Body location

If the next reference is part of the first response payload, you must use _body_ as next location.
While setting _body_, you must define the type of the reference and a json pointer to retrieve this reference.

The type defines either if the reference is a full uri or only a index to the next reference.

The json pointer must point to the attribut in the body containing the next reference.

For example with a first response:

```json
{
  "items": [
      {
         "item" : 1
      },
      {
         "item" : 2
      }
  ],
  "link": {
    "first": "/first/reference",
    "next" : "/next/reference"
  }
}
```

The configuration of the pagination section will look like:

```json
{
  "pagination" : {
    "mode": "page",
    "nextReference" : {
        "location": "body",
        "type" : "uri",
        "pointer" : "/links/next"
    }
  }
```

#### Header location

If the next reference is part of the _Link_ header, you must use _header_ location. See [RFC5988](https://datatracker.ietf.org/doc/html/rfc5988) for more information.

The _Link_ header must be designed to support pagination and must be formatted such as :
`<http://my-host/api?per_page=2&page=2>; rel="next", <http://my-host/api?per_page=2&page=36>; rel="last"`

Streams will retrieve next reference by finding _next_ relation in the _Link_ header.
The configuration of the pagination section will look like :

```json
{
  "pagination" : {
    "mode": "page",
    "nextReference" : {
        "location": "header"
    }
  }
```

### Removing http headers from configuration

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
