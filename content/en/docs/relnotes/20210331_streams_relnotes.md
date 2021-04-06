---
title: Streams March 2021 Release Notes
linkTitle: Streams March 2021 Release Notes
weight: 150
date: 2021-02-03
---

## Summary

Streams is available as a set of Docker containers deployable in Kubernetes by using a Helm chart.
For a summary of the system requirements, see [Install Streams](/docs/install/).

## New features and enhancements
<!-- Add the new features here -->
* [Event Payload](/docs/publishers) to support different types of data sources and distinguish data sources that provide a full data set (snapshot) from data sources directly providing events.
* [Custom Metrics](/docs/metrics) to provide additional insights on the health of Streams components when monitored via Prometheus.

## Important changes
<!-- Use this section to describe any changes in the behavior of the product (as a result of features or fixes), for example, new Java system properties in the jvm.xml file. This section could also be used for any important information that doesn't fit elsewhere. -->

It is important, especially when upgrading from an earlier version, to be aware of the following changes in the behavior or operation of the product in this new version.

### Streams REST APIs

Following change on Streams Rest APIs have been made to fully comply with Axway Rest API Guidelines:

#### New Rest API Paths

| Component | Old Path | New Path  |
| --------- | -------- | --------- |
| Hub (Topics) | /api/v1 | /streams/hub/api/v1 |
| Webhook Subscriber | /subscribers/webhook | /streams/subscribers/webhook/api/v1 |
| Kafka Subscriber | /subscribers/kafka/topics | /streams/subscribers/kafka/api/v1 |
| HTTP Post Publisher | /publishers/http-post | /streams/publishers/http-post/api/v1 |
| SSE Subscriber | /streams/subscribers/sse | /streams/subscribers/sse/api/v1 |

#### Pagination

Links related to [pagination](/docs/topics-api/#Pagination) are now provided as part of the response body.

#### Json Object as root element of the response body

Streams Rest APIs no longer return an `array` as root element of the response.
APIs returning a list of elements now return a JSON Objet as root element and an `array` wrapped in `items` attribute.

{{< alert title="Warning" color="warning" >}}Only new version of Streams Rest API is supported.{{< /alert >}}

### Streams Helm chart enhancements

The following enhancements have been made to Streams Helm chart:

* Helm chart dependency images upgraded:
    * Kafka new docker image tag: `2.7.0-debian-10-r104`
    * Zookeeper new docker image tag: `3.6.2-debian-10-r186`
    * MariaDB new docker image tag: `10.4.18-debian-10-r35`

* Helm chart dependencies upgraded:
    * Kafka Helm chart new version: `12.7.1`

* Helm chart refactoring:
    * CORS headers disabled by default (see [Ingress CORS](/docs/install/#ingress-cors)

## Deprecated features
<!-- Add features that are deprecated here -->

As part of our software development life cycle, we constantly review our Streams offering.
As part of this review, no capabilities have been deprecated.

## Removed features
<!-- Add features that are removed here -->
 To stay current and align our offerings with customer demand and best practices, Axway might discontinue support for some capabilities.

Following capabilities related to Streams Rest APIs are no longer supported:

* Old Rest API Paths, refer to [New Rest API Paths](/docs/relnotes/20210331_streams_relnotes/#new-rest-api-paths).
* Pagination related information provided as `Link` Header is no longer provided, refer to [Pagination](/docs/relnotes/20210331_streams_relnotes/#pagination).

## Fixed issues

There are no fixed issue in this version.

## Documentation

You can find the latest information and up-to-date user guides at the Axway Documentation portal at <https://docs.axway.com>.

This section describes documentation enhancements and related documentation.

### Documentation enhancements

<!-- Add a summary of doc changes or enhancements here-->

The latest version of Streams documentation has been migrated to Markdown format and is available in a [public GitHub repository](https://github.com/Axway/streams-open-docs) to prepare for future collaboration using an open source model. As part of this migration, the documentation has been restructured to help users navigate the content and find the information they are looking for more easily.

Documentation change history is now stored in GitHub. To see details of changes on any page, click the link in the last modified section at the bottom of the page.

### Related documentation

To find all available documents for this product version:

1. Go to <https://docs.axway.com/bundle>.
2. In the left pane Filters list, select your product or product version.

Customers with active support contracts need to log in to access restricted content.

## Support services

The Axway Global Support team provides worldwide 24 x 7 support for customers with active support agreements.

Email [support@axway.com](mailto:support@axway.com) or visit Axway Support at <https://support.axway.com>.
