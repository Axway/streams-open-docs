---
title: Streams Mai 2021 Release Notes
linkTitle: Streams Mai 2021 Release Notes
weight: 149
date: 2021-05-03
---

## Summary

Streams is available as a set of Docker containers deployable in Kubernetes by using a Helm chart.
For a summary of the system requirements, see [Install Streams](/docs/install/).

## New features and enhancements
<!-- Add the new features here -->

## Important changes
<!-- Use this section to describe any changes in the behavior of the product (as a result of features or fixes), for example, new Java system properties in the jvm.xml file. This section could also be used for any important information that doesn't fit elsewhere. -->

It is important, especially when upgrading from an earlier version, to be aware of the following changes in the behavior or operation of the product in this new version.

### Kafka upgraded to 2.8.0

Kafka version has been upgrade to latest 2.8.0.
No action is required in case of an embedded kafka. However in case your installation is using an external kafka, please follow this documentation to upgrade it: [Upgrading From Previous Versions](https://kafka.apache.org/28/documentation.html#upgrade)

### Streams Helm chart enhancements

The following enhancements have been made to Streams Helm chart:

* Helm chart dependency images upgraded:
    * Kafka new docker image tag: `2.8.0-debian-10-r10`
    * Zookeeper new docker image tag: `3.7.0-debian-10-r16`
    * MariaDB new docker image tag: `10.4.18-debian-10-r45`

## Deprecated features
<!-- Add features that are deprecated here -->

As part of our software development life cycle, we constantly review our Streams offering.
As part of this review, no capabilities have been deprecated.

## Removed features
<!-- Add features that are removed here -->
 To stay current and align our offerings with customer demand and best practices, Axway might discontinue support for some capabilities.

As part of this review, no features have been deprecated.

## Fixed issues

There are no fixed issues in this version.

## Documentation

You can find the latest information and up-to-date user guides at the Axway Documentation portal at <https://docs.axway.com>.

This section describes documentation enhancements and related documentation.

### Documentation enhancements

<!-- Add a summary of doc changes or enhancements here-->
There are no documentation enhancements in this version.

### Related documentation

To find all available documents for this product version:

1. Go to <https://docs.axway.com/bundle>.
2. In the left pane Filters list, select your product or product version.

Customers with active support contracts need to log in to access restricted content.

## Support services

The Axway Global Support team provides worldwide 24 x 7 support for customers with active support agreements.

Email [support@axway.com](mailto:support@axway.com) or visit Axway Support at <https://support.axway.com>.
