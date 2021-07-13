---
title: Streams May 2021 Release Notes
linkTitle: Streams May 2021 Release Notes
weight: 148
date: 2021-05-03
---

## Summary

Streams is available as a set of Docker containers deployable in Kubernetes by using a Helm chart. For a summary of the system requirements, see [Install Streams](/docs/install/).

## New features and enhancements

Streams now supports **at-least-once** delivery semantic to ensure that you receive all your messages. Streams handles this internally for persistent subscriptions and through the `Last-Event-Id` header for SSE subscriptions. For more information, see [Subscribers](/docs/subscribers/#quality-of-service-qos).

## Important changes
<!-- Use this section to describe any changes in the behavior of the product (as a result of features or fixes), for example, new Java system properties in the jvm.xml file. This section could also be used for any important information that doesn't fit elsewhere. -->

It is important, especially when upgrading from an earlier version, to be aware of the following changes in the behavior or operation of the product in this new version.

### Kafka topics renamed

The following topics have been renamed:

* *stream-transform-snapshot-last* renamed to *streams-transform-snapshot*
* *stream-transform-snapshot-patch* renamed to *streams-transform-snapshot*
* *stream-publish-snapshot* renamed to *streams-publish-snapshot*
* *stream-publish-event* renamed to *streams-publish-event*
* *stream-transform-event* renamed to *streams-transform-event*
* *stream-error* renamed to *streams-error*
* *webhook-exchange* renamed to *streams-subscriber-webhook-exchange*

### Kafka upgrade to 2.8.0

Kafka version has been upgrade to its latest version, 2.8.0. No action is required in case of an embedded kafka. However, in case your installation is using an external kafka, you must follow [Kafka - Upgrading From Previous Versions](https://kafka.apache.org/28/documentation.html#upgrade) to upgrade your Kafka's version.

### Streams Helm chart enhancements

The following Helm chart dependency images were upgraded:

* Kafka new docker image tag: `2.8.0-debian-10-r12`
* Zookeeper new docker image tag: `3.7.0-debian-10-r35`
* MariaDB new docker image tag: `10.4.18-debian-10-r66`
* NGINX new docker image tag: `0.44.0-debian-10-r58`

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
