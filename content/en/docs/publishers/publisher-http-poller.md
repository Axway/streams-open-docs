---
title: HTTP poller publisher
linkTitle: HTTP poller publisher
weight: 1
date: 2019-04-02
description: Learn how to configure a topic associated to an HTTP poller publisher.
---

Polling describes the mechanism used to retrieve data from an API - the client first needs to send a request to a server and the server responds by sending the requested data.

Because it is not possible for the client to know when the data is updated, it usually sends requests as often as possible to try to stick to reality and ends up using a lot of bandwidth and resources to receive the same data several times.

Streams provides the ability to instantly turns any request/response API into a real-time event-driven data feed. The HTTP poller publisher polls the target URL at the given period and publish the content in the associated topic.

Streams will then distribute the content (snapshot, computed patches) to all subscribed clients as soon as a change is detected in the response of the target URL.

## Understand HTTP poller publisher configuration

The HTTP poller publisher requires the following specific configuration.

| Attribute                     | Mandatory | Default Value  | Description                                                                                                                                                                                                                                                                                                               |
| ----------------------------- | --------- | -------------- |---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| url                           | yes       | N/A            | Target URL to request.                                                                                                                                                                                                                                                                                                    |
| pollingPeriod                 | no        | PT5S (5 sec)   | Period at witch the target URL will be requested. Min: PT0.5S Max: PT1H. This parameter must follow the [ISO-8601](https://en.wikipedia.org/wiki/ISO_8601#Durations) format.                                                                                                                                               |
| payloadPointer                | no        | N/A            | Defines a JSON pointer to an attribute parameter [RFC6901](https://datatracker.ietf.org/doc/html/rfc6901).                                                                                                                                                                                                                |
| headers                       | no        | N/A            | Map of key/value pairs that will be injected as HTTP headers when requesting the target URL.                                                                                                                                                                                                                              |
| retryOnHttpCodes              | no        | 500,503,504    | A list of HTTP codes which will trigger the retry. Other codes generate an error without any retry.                                                                                                                                                                                                                       |
| retryMaxAttempts              | no        | 3              | The maximum number of retries in case of errors.                                                                                                                                                                                                                                                                          |
| retryBackOffInitialDuration   | no        | PT1S           | Period of time after which the first retry is attempted (ISO-8601 format). Min = PT0S (0s); Max = PT10S (10s).                                                                                                                                                                                                            |
| retryBackOffMaxDuration       | no        | PT10S          | Maximum period of time between two attempts (ISO-8601 format). Min = PT0S (0s); Max = PT60S (60s).                                                                                                                                                                                                                        |
| retryBackOffFactor            | no        | 0.5            | The factor used to determine the next retry duration.                                                                                                                                                                                                                                                                     |
| computedQueryParameters       | no        | none           | Map of [ComputedQueryParameters](/docs/publishers/publisher-http-poller/#computed-query-parameters) that will be injected as query parameters. The key, query parameter name, must use URL-safe characters. For more information, see [Unreserved Characters](https://datatracker.ietf.org/doc/html/rfc2396#section-2.3). |
| authorization                 | no        | N/A            | OAuth2 Authorization configuration. For more information, see section [OAuth2 Authorization](#authorization-with-oauth-2-0)                                                                                                                                                                                               |
| pagination                    | no        | N/A            | Pagination mechanism configuration. For more information, see section [Pagination](#pagination)                                                                                                                                                                                                                           |

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
        "authorization": {
          "type": "oauth2",
          "clientId": "myclientId",
          "clientSecret": "myclientSecret",
          "provider": "http://authorization.com/oauth/token",
          "scope": "READ,WRITE",
          "mode": "body"
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
              "useMilliseconds": true,
              "initialValue": 1641224429000
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

## Authorization with OAuth 2.0

The HTTP poller publisher can fetch data from an API that is secured with [OAuth2](https://datatracker.ietf.org/doc/html/rfc6749) protocol. Because the HTTP poller publisher authenticates to the authorization server without any end-user interaction, the only OAuth2 authorization grant type supported is the [client credentials](https://datatracker.ietf.org/doc/html/rfc6749#section-4.4).

The OAuth2 authorization workflow is implemented with the following limitations:

* The OAuth2 authorization workflow is initiated on the authorization server URL for the first polling, and the retrieved access token is reused for following requests until it expires.
* Refresh token mechanism is not implemented.
* Only access token of type [Bearer](https://datatracker.ietf.org/doc/html/rfc6749#section-7.1) is supported.
* The authorization request is made via a `POST` method on the authorization server, and the client credentials are sent either via `header` or `body`.

The following table lists the OAuth2 authorization configuration:

| Attribute                     | Mandatory | Default value | Description            |
| ----------------------------- | --------- |---------------| ---------------------- |
| type                          | yes       | N/A           | Type of authorization protocol configured on the API. Currently, only `oauth2` is supported. |
| clientId                      | yes       | N/A          | The client identifier issued during the registration process.  |
| clientSecret                  | yes       | N/A          | The client secret issued during the registration process.  |
| provider                      | yes       | N/A          | Target URL of the authorization server. |
| mode                          | yes       | header        | Whether to send [client authentication](https://datatracker.ietf.org/doc/html/rfc6749#section-2.3.1) via `body` or a basic authorization `header`. |
| scope                         | no        | N/A          | A [scope](https://datatracker.ietf.org/doc/html/rfc6749#section-3.3) request parameter. |

The following is an example of how to implement OAuth authorization:

```json
{
  "name": "myHttpPollerTopic",
  "publisher": {
    "type": "http-poller",
    "config": {
      "url": "https://myserver/my-api",
      "authorization": {
        "type": "oauth2",
        "clientId": "myclientId",
        "clientSecret": "myclientSecret",
        "provider": "http://authorization.com/oauth/token",
        "scope": "READ",
        "mode": "header"
      }
    }
  }
}
```

## Computed query parameters

Computed query parameters are query parameters injected to the target URL at each polling. They are based on the `last-success` *reference*, which is the instant corresponding to the last successful request execution.

| Attribute  | Mandatory | Default Value  | Description            |
| ---------- | --------- | ------       | ---------------------- |
| reference  | yes       | last-success | Defines the reference of the computed query parameter. |

### DateTime format

You can format the reference value as DateTime. This must follow the [Java DateTimeFormatter](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/time/format/DateTimeFormatter.html#patterns) pattern.

| Attribute    | Mandatory | Default Value         | Description                                                                                                                  |
|--------------| --------------------         |-----------------------|------------------------------------------------------------------------------------------------------------------------------|
| type         | yes | date-time             | The reference is formatted in a DateTime format.                                                                             |
| pattern      | no  | yyyy-MM-dd'T'HH:mm:ssXXX | Pattern used to format the reference.                                                                                        |
| initialValue | no  | N/A                      | DateTime used when the HTTP Poller Publisher starts publishing data to a topic for the first time. It must follow `pattern` format. If no value is configured, the HTTP poller publisher will use the default dateTime : `currentRequestDateTime` - `pollingPeriod` to make the first request. Subsequent requests are not impacted.|

The following is an example of how to dynamically add a `from` query parameter to the target URL based on the `last-success` reference with the following format `yyyy-MM-dd'T'HH:mm:ss`, by using the `computedQueryParameters` attribute with `initialValue` :

```json
{
  "name": "myHttpPollerTopic",
  "publisher": {
    "type": "http-poller",
    "config": {
        "url": "https://myserver/my-api",
        "pollingPeriod": "PT1M",
        "computedQueryParameters": {
            "from": {
              "type": "date-time",
              "reference": "last-success",
              "pattern": "yyyy-MM-dd'T'HH:mm:ss",
              "initialValue": "2021-09-22T09:56:09"
            }
        }
    }
  }
}
```

Based on the configured `initialValue`, the first call to the target URL will be `https://myserver/my-api?from=2021-09-22T09:56:09`, and the subsequent calls, according to the configured polling period will be: `https://myserver/my-api?from=2021-09-23T10:57:09`, `https://myserver/my-api?from=2021-09-23T10:58:09`, `https://myserver/my-api?from=2021-09-23T10:59:09`, and so on.

### Timestamp format

You can format the reference value as a timestamp.

| Attribute       | Mandatory | Default Value | Description                                                                                                                                                                                      |
|-----------------| -------------------- |---------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| type            | yes | timestamp     | The reference is formatted as a Timestamp.                                                                                                                                                       |
| useMilliseconds | no  | false         | If true, the timestamp is measured in milliseconds, otherwise in seconds.                                                                                                                        |
| initialValue    | no  | N/A           | Timestamp used when the HTTP Poller Publisher starts publishing data to a topic for the first time, specified in milliseconds or seconds, depending on what is configured in the `useMilliseconds` attribute. If no value is configured, the HTTP poller publisher will use the default dateTime : `currentRequestDateTime` - `pollingPeriod` to make the first request. Subsequent requests are not impacted |

The following is an example of how to add a `from` query parameter to the target URL based on the `last-success` reference as a Timestamp, by using the `computedQueryParameters` attribute with `initialValue` :

```json
{
  "name": "myHttpPollerTopic",
  "publisher": {
    "type": "http-poller",
    "config": {
        "url": "https://myserver/my-api",
        "pollingPeriod": "PT60S",
        "computedQueryParameters": {
            "from": {
              "type": "timestamp",
              "reference": "last-success",
              "initialValue": 1641290851
            }
        }
    }
  }
}
```

Based on the configured `initialValue`, the first call to the target URL will be `https://myserver/my-api?from=1641290851`, and the subsequent calls, according to the configured polling period will be : `https://myserver/my-api?from=1641377251`, `https://myserver/my-api?from=1641377311`, `https://myserver/my-api?from=1641377371`, etc

## Pagination

The pagination section allows you to define how to paginate through your URL when it is using a pagination mechanism.

The following are the types of pagination supported by the HTTP poller publisher:

* [Page](#page)
* [Offset](#offset)
* [Keyset](#keyset)
* [Cursor](#cursor)

### Page

In this type of pagination, the set of items is divided into pages. The endpoint accepts a `page` parameter (integer) indicating the page within the list to be returned, and a `pageSize` parameter (integer) indicating the number of items per page, for example `/items?page=2&pageSize=10`.

| Attribute                     | Mandatory | Default Value  | Description                                                                             |
| ----------------------------- | --------- | -------------- | ----------------------                                                                  |
| mode                          | yes       | page           | Defines the page mode to use.                                                             |
| page.parameterName            | no        | page           | Parameter used for the page index.                                                       |
| page.initial                  | no        | 1              | Initial value of the first page. Must be equals to or higher than 0.                         |
| pageSize.parameterName        | no        | pageSize       | Parameter used for the number of elements per page.                                      |
| pageSize.value                | no        | 100            | Defines the number of items per page. Must be higher than 0.                              |
| nextReference.location             | yes       | N/A       | Either `body` or `header`. For more information, see section [Next reference](#next-reference).   |
| nextReference.type                 | yes       | N/A       | Only if location is `body`. Defines the type of the next reference.                           |
| nextReference.pointer              | yes       | N/A       | Only if location is `body`. JSON pointer to the attribute containing the next reference. For more information, see [RFC6901](https://datatracker.ietf.org/doc/html/rfc6901). |

The following is an example of an HTTP poller publisher configuration with page pagination mode:

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

The offset mode is a similar approach to the page mode, but it uses different parameters, `offset` and `limit`.

The `offset` parameter tells the server the number of items to be skipped, while the `limit` parameter indicates the number of items to be returned, for example, `/items?offset=10&limit=10`.

| Attribute                     | Mandatory | Default Value  | Description                                                                             |
| ----------------------------- | --------- | -------------- | ----------------------                                                                  |
| mode                          | yes       | offset         | Defines the page mode to use.                                                             |
| offset.parameterName          | no        | offset         | Parameter used for the page index.                                                       |
| offset.initial                | no        | 1              | Initial value of the first page. Must be equals to or higher than 0.                         |
| limit.parameterName           | no        | limit          | Parameter used for the number of elements per page.                                      |
| limit.value                   | no        | 100            | Defines the number of items per page. Must be higher than 0.                              |
| nextReference.location        | yes       | N/A            | Either `body` or `header`. For more information, see section [Next reference](#next-reference).  |
| nextReference.type            | yes       | N/A            | Only if location is `body`. Defines the type of the next reference.                           |
| nextReference.pointer         | yes       | N/A            | Only if location is `body`. JSON pointer to the attribute containing the next reference. For more information, see [RFC6901](https://datatracker.ietf.org/doc/html/rfc6901). |

The following is an example of an HTTP poller publisher configuration with offset pagination mode:

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

### Keyset

In this pagination type, the endpoint provides a `key` parameter that acts as a delimiter of the page. This key parameter must be the same key of the set sort order. For example, if the set is sorted by ID, then the key parameter should be `sinceId`. The first request does not contain the delimiter parameter. The response of this request contains the value of the key for the last element of the set. The endpoint accepts a `key` parameter indicating the next elements to start the next page, and a `pageSize` parameter (integer) indicating the number of items per page, for example `/items?since_key=next_key&pageSize=10`.

| Attribute                     | Mandatory | Default Value  | Description                                                                             |
| ----------------------------- | --------- | -------------- | ----------------------                                                                  |
| mode                          | yes       | keyset         | Defines the page mode to use .                                                            |
| key.parameterName             | no        | since_key      | Parameter used for the key.                                                              |
| pageSize.parameterName        | no        | pageSize       | Parameter used for the number of elements per page .                                     |
| pageSize.value                | no        | 100            | Defines the number of items per page. Must be higher than 0.                              |
| nextReference.location        | yes       | N/A            | Either `body` or `header`. For more information, see section [Next reference](#next-reference).    |
| nextReference.type            | yes       | N/A            | Only if location is `body`. Defines the type of the next reference.                           |
| nextReference.pointer         | yes       | N/A            | Only if location is `body`. JSON pointer to the attribute containing the next reference. For more information, see [RFC6901](https://datatracker.ietf.org/doc/html/rfc6901). |

The following is an example of an HTTP poller publisher configuration with keyset pagination mode:

```json
{
  "name": "topic-with-page-mode",
  "publisher": {
    "type": "http-poller",
    "config": {
      "url": "http://my-host/api",
      "pagination" : {
        "mode": "keyset",
        "key" : {
            "parameterName": "sinceKey"
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

### Cursor

Given a set ot items, a cursor will be a piece of data that contains a pointer to an element and the information to get the next elements. The server must return the cursor pointing to the next page in each request. The endpoint accepts a `cursor` parameter indicating the next element to start the next page, and a `pageSize` parameter (integer) indicating the number of items per page, for example `/items?cursor=next_items_cursor&pageSize=10`.

| Attribute                     | Mandatory | Default Value  | Description                                                                             |
| ----------------------------- | --------- | -------------- | ----------------------                                                                  |
| mode                          | yes       | cursor         | Define the page mode to use                                                             |
| cursor.parameterName          | no        | cursor         | Parameter used for the cursor                                                           |
| pageSize.parameterName        | no        | pageSize       | Parameter used for the number of elements per page                                      |
| pageSize.value                | no        | 100            | Define the number of items per page. Must be higher than 0                              |
| nextReference.location        | yes       | N/A            | Either `body` or `header`. For more information, see section [Next reference](#next-reference)|
| nextReference.type            | yes       | N/A            | Only if location is `body`. Defines the type of the next reference                           |
| nextReference.pointer         | yes       | N/A            | Only if location is `body`. JSON pointer to the attribute containing the next reference. For more information, see [RFC6901](https://datatracker.ietf.org/doc/html/rfc6901). |

The following is an example of an HTTP poller publisher configuration with cursor pagination mode:

```json
{
  "name": "topic-with-page-mode",
  "publisher": {
    "type": "http-poller",
    "config": {
      "url": "http://my-host/api",
      "pagination" : {
        "mode": "cursor",
        "cursor" : {
            "parameterName": "cursor"
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

### Next reference

You can define two ways to retrieve the next reference location, regardless the pagination mode chosen. The next reference must be either in the `body` of the first response or in the header `Link`.

#### Body location

If the next reference is part of the first response payload, you must use `body` as next location. While setting `body`, you must define the `type` of the reference and a JSON pointer to retrieve this reference. The `type` defines whether the reference is an `uri` or only a `value` to the next reference. The JSON pointer must point to the attribute in the body containing the next reference.

For example, with a first response:

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

If the next reference is part of the `Link` header, you must use `header` location. For more information, see [RFC5988](https://datatracker.ietf.org/doc/html/rfc5988).

The `Link` header must be designed to support pagination and must be formatted as follows:

```
<http://my-host/api?per_page=2&page=2>; rel="next", <http://my-host/api?per_page=2&page=36>; rel="last"
```

Streams retrieves the next reference by finding the `next` relation in the `Link` header.

The configuration of the pagination section will look like:

```json
{
  "pagination" : {
    "mode": "page",
    "nextReference" : {
        "location": "header"
    }
  }
```

## Remove HTTP headers from configuration

To remove a header from the configuration of the publisher, set the header value to `null` when calling the `PATCH /streams/hub/api/v1/topics/{{topicId}}` endpoint. For example:

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
