---
title: Streams June 2021 Release Notes
linkTitle: Streams June 2021 Release Notes
weight: 149
date: 2021-06-14
---

## Summary

Streams is available as a set of Docker containers deployable in Kubernetes by using a Helm chart. For a summary of the system requirements, see [Install Streams](/docs/install/).

## Important changes
<!-- Use this section to describe any changes in the behavior of the product (as a result of features or fixes), for example, new Java system properties in the jvm.xml file. This section could also be used for any important information that doesn't fit elsewhere. -->

It is important, especially when upgrading from an earlier version, to be aware of the following changes in the behavior or operation of the product in this new version.

### Kafka headers renamed

The following kafka headers have been renamed:

* *stream_pipelineId* renamed to *streams_pipelineId*
* *stream_dataType* renamed to *streams_dataType*
* *streams_sourceTimestamp* renamed to *stream_sourceTimestamp*

### Streams Helm chart enhancements

The following Helm chart dependency images were upgraded:

* Kafka new docker image tag: `2.8.0-debian-10-r35`
* Zookeeper new docker image tag: `3.7.0-debian-10-r62`
* MariaDB new docker image tag: `10.4.19-debian-10-r32`

## Deprecated features
<!-- As part of our software development life cycle, we constantly review our Streams offering. -->

As part of this review, no capabilities have been deprecated.

## Removed features
<!-- To stay current and align our offerings with customer demand and best practices, Axway might discontinue support for some capabilities. -->

As part of this review, no features have been deprecated.

## Fixed issues

There are no fixed issues in this version.

## Documentation

There are no major changes in this update.

### Related documentation

To find all available documents for this product version:

Go to Manuals on the Axway Documentation portal.

1. Go to [Product Manuals](https://docs.axway.com/bundle), in the Axway Documentation portal.
2. In the left pane Filters list, select your product or product version.

Customers with active support contracts need to log in to access restricted content.

## Support services

The Axway Global Support team provides worldwide 24 x 7 support for customers with active support agreements.

Email [support@axway.com](mailto:support@axway.com) or visit Axway Support at <https://support.axway.com>.
