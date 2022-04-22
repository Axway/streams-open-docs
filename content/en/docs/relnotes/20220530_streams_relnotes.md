---
title: Streams May 2022 Release Notes
linkTitle: Streams May 2022 Release Notes
weight: 142
date: 2022-04-05
---

## Summary

Streams is available as a set of Docker containers deployable in Kubernetes by using a Helm chart. For a summary of the system requirements, see [Install Streams](/docs/install/).

## New features and enhancements

* [Kafka subscription configured with Sasl and SSL](/docs/subscribers/subscriber-kafka/#authorization-with-sasl-and-ssl): add security capability for kafka subscription

## Important changes
<!-- Use this section to describe any changes in the behavior of the product (as a result of features or fixes), for example, new Java system properties in the jvm.xml file. This section could also be used for any important information that doesn't fit elsewhere. -->

It is important, especially when upgrading from an earlier version, to be aware of the following changes in the behavior or operation of the product in this new version.

### Streams Helm chart enhancements

The following Helm chart dependency images were upgraded:

* Kafka new docker image tag: `2.8.1-debian-10-r43`
* Zookeeper new docker image tag: `3.7.0-debian-10-r338`
* MariaDB new docker image tag: `10.4.24-debian-10-r47`
* Nginx-ingress-controller new docker image tag: `1.1.2-debian-10-r27`

## Deprecated features
<!-- As part of our software development life cycle, we constantly review our Streams offering. -->

As part of this review, no capabilities have been deprecated.

## Removed features
<!-- To stay current and align our offerings with customer demand and best practices, Axway might discontinue support for some capabilities. -->

As part of this review, no features have been deprecated.

## Fixed issues

There are no fixed issues in this version.

## Documentation

To find all available documents for this product version:

Go to Manuals on the Axway Documentation portal.

1. Go to [Product Manuals](https://docs.axway.com/bundle), in the Axway Documentation portal.
2. In the left pane Filters list, select your product or product version.

Customers with active support contracts need to log in to access restricted content.

## Support services

The Axway Global Support team provides worldwide 24 x 7 support for customers with active support agreements.

Email [support@axway.com](mailto:support@axway.com) or visit Axway Support at <https://support.axway.com>.
