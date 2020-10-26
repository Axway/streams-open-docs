---
title: Subscription Errors
linkTitle: Subscription Errors
weight: 4
date: 2019-04-02
description: Describes the different type of errors that can occurs during a subscription to Streams. 
---

*This section is relevant for any type of subscribers.*

## Errors during subscription

When a problem occurs during subscription, an error event is sent.

Example:

```json
{
    "datetime": "2018-09-03T13:16:02.120Z",
    "subscriptionId": "f6cc363f-6516-4dc9-b1ad-1352fc51fd64",
    "code": 40000,
    "category": "subscription",
    "message": "Subscriber error"
}
```

It contains:

| Attribute | Description |
|-----------|-------------|
| datetime | Datetime of the error |
| subscriptionId | Unique identifier of the subscription |
| code | Status code of the error |
| category | Category to which the error belongs. Refer to [Error Categories](#error-categories) section.|
| message | Human readable message describing the error

For programmatic error processing, only the code and category must be used.

### Error Categories

All errors are organized into different categories:

* **subscription** for errors that may occur during the client subscription phase
* **server** for internal errors that may occur on Streams platform components
* **topic** for errors related to the data processing and transformation of a topic
* **publication** for errors related to the publication in a topic

#### Subscription Errors

This error category is intended for situations where the error was caused by the subscriber (client).

```json
{
    ...
    "code": 4xxxx,
    "category": "subscription",
    ...
}
```

| Error Code | Description |
|------------|-------------|
| 40000 | Subscription error |
| 40400 | Bad request |
| 40404 | Topic not found |
| 40405 | Subscription not found |

#### Topic Errors

This error occurs when an internal error occurs on topic service.

```json
{
    ...
    "code": 60000,
    "category": "topic",
    ...
}
```

| Error Code | Description |
|------------|-------------|
| 60000 | topic error |

#### Server Errors

This category of errors is intended for situations in which the server is aware that it has encountered an error or is otherwise incapable of performing the request.

```json
{
    ...
    "code": 5xxxx,
    "category": "server",
    ...
}
```

| Error Code | Description |
|------------|-------------|
| 50000 | Server error |
| 50500 | Internal error |
| 50503 | Service unavailable |

#### Publication Errors

This category of error is intended for situations in which the error seems to have been caused by the Publisher (Data source).

```json
{
    ...
    "code": 7xxxx,
    "category": "publication",
    ...
}
```

| Error Code | Description |
|------------|-------------|
| 70000 | Publisher error |
| 70001 | Publisher configuration invalid |
| 70002 | Publisher startup error |
| 70012 | Source unknown error |
| 70013 | Source connection error |
| 70014 | Source host unknown |
| 70015 | Source response size limit exceeded |
| 70016 | Unsupported source format |
| 70300 | Source redirection unsupported |
| 70400 | Source bad request |
| 70401 | Source unauthorized |
| 70403 | Source forbidden |
| 70404 | Source not found |
| 70405 | Source method not allowed |
| 70406 | Source not acceptable |
| 70408 | Source request timeout |
| 70410 | Source publication refused |
| 70429 | Source too many requests |
| 70500 | Source internal server error |
| 70502 | Source bad gateway |
| 70503 | Source service unavailable |
| 70504 | Source gateway timeout |
