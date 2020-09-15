---
title: Topics API
linkTitle: Topics API
weight: 150
date: 2019-04-02
description: The Streams Topics API provides programmatic access to efficiently manage pub/sub topics.
---

## DevOps integration

Streams supports your DevOps processes by providing an API for you to automate your configuration and deployments.
Streams Topics API enables you to fully manage every aspects of Streams topics.

### What is DevOps?

DevOps can be defined as a combination of people, processes, and technology that increases your organization's ability to quickly deliver quality services to your customers.

* **People**: Developers, operations, product owners, testers, infrastructure engineers, and so on, all work together collaboratively as a team to build and deliver the service.
* **Process**: Continuous improvement of the process to deliver a quality service is key.
* **Technology**: Tools that automate the manual processes and integrate with other tools to make it easier and faster to develop, package, test, release, and deploy the service.

### Streams DevOps approach

Taking a DevOps approach to Event-Driven API management with Streams enables you to streamline the delivery of updates or new capabilities in your services to your customers and partners.

Streams is a CI/CD native solution that you can easily snap in to your existing DevOps pipeline. Simplify and customize how you manage Event-Driven APIs across your organization by using the Streams Management API to manage every aspects of your topics.

## Streams Management API Overview

Our API is organized around REST and has predictable, resource-oriented URLs, and uses HTTP response codes to indicate API errors.
We use built-in HTTP features, like HTTP verbs, which are understood by off-the-shelf HTTP clients. We support cross-origin resource sharing, allowing you to interact securely with our API from a client-side web application.
JSON is returned by all API responses, including errors. Finally, we rely on gzip format to compress all API responses via the `Content-Encoding` entity header.

{{< alert title="Note" >}}
Streams installation material includes [OpenAPI](https://swagger.io/specification/) specifications and [Postman collections](https://www.postman.com/collection) to help you get started quickly.
{{< /alert >}}

### Error codes

Streams Management API uses conventional HTTP response codes to indicate the success or failure of an API request.
In general, codes in the `2xx` range indicate success, codes in the `4xx` range indicate an error that failed given the information provided (e.g., a required parameter was omitted, etc.), and codes in the `5xx` range indicate an error with Streams' servers.

#### HTTP status code summary

| Status Code | Description |
|-------------|-------------|
| 200 OK | Everything worked as expected. |
| 400 Bad Request | The request was unacceptable, often due to missing a required parameter. |
| 404 Not Found | The requested resource doesn't exist. |
| 409 Conflict | The request conflicts with current state of the resource. |
| 500, 502, 503, 504 Server Errors | Something went wrong on Streams' platform end. |

#### Pagination

To start with, it's important to know a few facts about receiving paginated items:

By default, a call to the Streams API provides items in sets of `20`.
You can specify how many items to receive (up to a maximum of `1000`) via the `pageSize` query parameter.
All paginated queries start at page `1`.
Pagination information is provided by the `Link` header of a response.

For example, let's make a request to the `GET /api/v1/topics` endpoint with the `pageSize` query param set to `5`.
The `Link` header will contain a list of element separated by comma pointing to the different pages allowing you to navigate easily.

```
</api/v1/topics?page=1&pageSize=5>; rel="self"; pageSize="5",</api/v1/topics?page=1&pageSize=5>; rel="first"; pageSize="5",</api/v1/topics?page=2&pageSize=5>; rel="next"; pageSize="5",</api/v1/topics?page=5&pageSize=5>; rel="last"; pageSize="5"
```

##### Navigating through the pages

Now that you know how many pages there are to receive, you can start navigating through the pages to consume the results. You do this by passing in a `page` parameter.

Changing the number of items received
By passing the `pageSize` parameter, you can specify how many items you want each page to return, up to `1000` items.

##### Sort items using pagination

When using pagination, you can sort paginated items by specifying the `field` and the `direction` (ASC or DESC) in the query param `sort`. For example, to sort topics by name add the `sort=name,DESC` query param.

The field names allowed for sorting are :

* name
* createTimestamp
* modifyTimestamp
* publisher.type
* publisher.payload.type

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
