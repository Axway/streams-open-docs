---
title: Streams January 2021 Release Notes
linkTitle: Streams Jan 2021 Release Notes
weight: 150
date: 2021-02-03
---

## Summary

Streams is available as a set of Docker containers deployable in Kubernetes by using a Helm chart.
For a summary of the system requirements, see [Install Streams](/docs/install/).

## New features and enhancements
<!-- Add the new features here -->
* [Webhook Exchange History](/docs/subscribers/subscriber-webhook/#getting-the-webhook-notification-history-for-a-subscription) to give API consumers access to the history of exchanges (requests/responses) that occurred between Streams and their webhook endpoint.
* [Webhook Testing Endpoint](/docs/subscribers/subscriber-webhook/#testing-a-webhook-subscription) to enable API consumers to send test payloads to their webhook endpoint.

## Important changes
<!-- Use this section to describe any changes in the behavior of the product (as a result of features or fixes), for example, new Java system properties in the jvm.xml file. This section could also be used for any important information that doesn't fit elsewhere. -->

It is important, especially when upgrading from an earlier version, to be aware of the following changes in the behavior or operation of the product in this new version.

### Webhook subscription status

The webhook subscription status `subscriptionStatus` is now automatically set to `suspended` when the webhook endpoint responds with `410 GONE` status code. When subscription status is `suspended`, Streams no longer attempts to send webhook notifications. The subscription can be reactivated by setting `subscriptionStatus` to `active` via a `PATCH` operation on `/subscribers/webhook/subscriptions/{{subscriptionId}}` endpoint.

### Streams Helm chart enhancements

The following enhancements have been made to Streams Helm chart:

* Helm chart dependency images upgraded:
    * Kafka new docker image tag: `2.6.0-debian-10-r110`
    * Zookeeper new docker image tag: `3.6.2-debian-10-r112`
    * MariaDB new docker image tag: `10.4.17`
    * NGINX new docker image tag: `v0.43.0`

* Helm chart dependencies upgraded:
    * NGINX Helm chart new version: `3.20.1`

* Helm chart refactoring:
    * All common microservice parameters can be set in a single place.
    * `AdditionalJavaOpts` has been added.
    * `JvmMemoryOpts` will be computed automatically from k8s resources if not specified.
    * `ingress.host` Helm chart parameter is now mandatory at installation. See [Ingress hostname](/docs/install/#ingress-hostname) section for details.

## Deprecated features
<!-- Add features that are deprecated here -->

As part of our software development life cycle, we constantly review our Streams offering.
As part of this review, no capabilities have been deprecated.

## Removed features
<!-- Add features that are removed here -->

To stay current and align our offerings with customer demand and best practices, Axway might discontinue support for some capabilities. No capabilities have been removed in this version.

## Fixed issues

There are no fixed issue in this version.

### Fixed security vulnerabilities

There are no fixed security vulnerabilities in this version.

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
