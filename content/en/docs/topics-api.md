---
title: Topics API
linkTitle: Topics API
weight: 5
date: 2019-04-02
description: The Streams Topics API provides programmatic access to efficiently manage pub/sub topics.
---

## Streams Topics API Overview

Our API is organized around REST and has predictable, resource-oriented URLs, and uses HTTP response codes to indicate API errors.
We use built-in HTTP features, like HTTP verbs, which are understood by off-the-shelf HTTP clients. We support cross-origin resource sharing, allowing you to interact securely with our API from a client-side web application.
JSON is returned by all API responses, including errors. Finally, we rely on gzip format to compress all API responses via the `Content-Encoding` entity header.

{{< alert title="Note" >}}
Streams installation material includes [OpenAPI](https://swagger.io/specification/) specifications and [Postman collections](https://www.postman.com/collection) to help you get started quickly.
{{< /alert >}}

### Pagination

To start with, it's important to know a few facts about receiving paginated items:

By default, a call to the Streams API provides items in sets of `20`.
You can specify how many items to receive (up to a maximum of `1000`) via the `pageSize` query parameter.
All paginated queries start at page `1`.
Pagination information is provided by the `Link` header of a response.

For example, let's make a request to the `GET /streams/hub/api/v1/topics` endpoint with the `pageSize` query param set to `5`.
The `links` section of the response body will contain a list of element separated by comma pointing to the different pages allowing you to navigate easily.

```
"links":{"self":"/streams/hub/api/v1/topics?page=1&pageSize=5", "first":"/streams/hub/api/v1/topics?page=1&pageSize=5","next":"/streams/hub/api/v1/topics?page=2&pageSize=5","last":"/streams/hub/api/v1/topics?page=5&pageSize=5"}
```

#### Navigating through the pages

Now that you know how many pages there are to receive, you can start navigating through the pages to consume the results. You do this by passing in a `page` parameter.

Changing the number of items received
By passing the `pageSize` parameter, you can specify how many items you want each page to return, up to `1000` items.

#### Sort items using pagination

When using pagination, you can sort paginated items by specifying the `field` and the `direction` (ASC or DESC) in the query parameter `sort`. For example, to sort topics by name add the `sort=name,DESC` query param.

The field names allowed for sorting are :

* name
* createTimestamp
* modifyTimestamp
* publisher.type
* publisher.payload.type

### Search

Streams Rest APIs (topics, subscriptions) support searching resources.
It is available on all `GET` endpoints by specifying a search expression in the `search` query parameter.

Your search expression must comply with the following rules:

* It must be passed as query parameter (e.g. `?search=<expression>`).
* It can either contain a single or a combination of operands:
    * A _simple_ expression is an operand that is used on its own as an expression.
    * A _complex_ expression is the combination of two or more operands using the operators `AND` or `OR`.
* _Parenthesis_ can be used to group operand (e.g. `( operand1 OR operand2 ) AND operand3`).
* _Space_ must be used as delimiter.
* Each _operand_ must use at least one of the 3 available operators:
    * Equals (e.g. `property:value`).
    * Not equals (e.g. `property!value`).
    * Exists (e.g. `property?`).
* Values containing white-spaces must be protected by _double quotes_ (e.g. `property:"a value with white spaces"`).

{{< alert title="Note" >}}
Note that search capability works:

* on all attributes including key/value maps (except `config`).
* on nested properties (e.g. `property.sub_property:value`).
* in combination of [pagination](#pagination).
{{< /alert >}}

### Error codes

Streams Topics API uses conventional HTTP response codes to indicate the success or failure of an API request.
In general, codes in the `2xx` range indicate success, codes in the `4xx` range indicate an error that failed given the information provided (e.g., a required parameter was omitted, etc.), and codes in the `5xx` range indicate an error with Streams' servers.

#### HTTP status code summary

| Status Code | Description |
|-------------|-------------|
| 200 OK | Everything worked as expected. |
| 400 Bad Request | The request was unacceptable, often due to missing a required parameter. |
| 404 Not Found | The requested resource doesn't exist. |
| 409 Conflict | The request conflicts with current state of the resource. |
| 500, 502, 503, 504 Server Errors | Something went wrong on Streams' platform end. |

### Versioning

We use [semantic versioning](https://semver.org/). Given a version number `MAJOR.MINOR.PATCH`, we increment the:

* `MAJOR` version when we make backwards-incompatible changes,
* `MINOR` version when we add functionality in a backwards-compatible manner,
* `PATCH` version when we make backwards-compatible bug fixes.

#### Backwards compatibility

Backwards-compatible changes (non-breaking):

* Adding an new API resources
* Adding new optional request parameters to existing API methods
* Adding a new method to an existing API resources
* Adding a new optional field to a request body
* Adding a new field to existing API responses
* Changing the order of field in existing API responses
* Adding a value to an enum

Backwards-incompatible changes (breaking).

* Removing or renaming a service, interface, field, method or enum value
* Changing an HTTP binding
* Changing the type of a field
* Changing a resource name format
* Changing visible behavior of existing requests
* Changing the URL format in the HTTP definition
