---
title: Streams Jan 2021 Release Notes
linkTitle: Streams Jan 2021 Release Notes
weight: 150
date: 2021-02-03
---

## Summary

Streams is available as a set of Docker containers deployable in Kubernetes thanks to a Helm Chart.
For a summary of the system requirements, see [Install Streams](/docs/install/).

## New features and enhancements
<!-- Add the new features here -->
* [Webhook Exchange History](/docs/subscribers/subscriber-webhook/#getting-the-webhook-notification-history-for-a-subscription) to give API consumers access to the history of exchanges (requests/responses) that occurred between Streams and their Webhook endpoint.
* [Webhook Testing Endpoint](/docs/subscribers/subscriber-webhook/#testing-a-webhook-subscription) to enable API consumers to send test payloads to their webhook endpoint.

## Important changes
<!-- Use this section to describe any changes in the behavior of the product (as a result of features or fixes), for example, new Java system properties in the jvm.xml file. This section could also be used for any important information that doesn't fit elsewhere. -->

It is important, especially when upgrading from an earlier version, to be aware of the following changes in the behavior or operation of the product in this new version.

### Webhook subscription status

The Webhook Subscription status `subscriptionStatus` is now automatically set to `suspended` when the Webhook endpoint responds with `410 GONE` status code. When subscription is status is `suspended`, Streams no longer attempts to send Webhook notifications. The subscription can be reactivated by setting `subscriptionStatus` to `active` via a `PATCH` operation on `/subscribers/webhook/subscriptions/{{subscriptionId}}` endpoint.

### Streams Helm Chart enhancements

Following enhancements have been made to Streams Helm Chart:
<!-- TODO: Describe impact for customer -->

## Deprecated features
<!-- Add features that are deprecated here -->

As part of our software development life cycle we constantly review our Streams offering.
As part of this review, no capabilities have been deprecated.

## Removed features
<!-- Add features that are removed here -->

To stay current and align our offerings with customer demand and best practices, Axway might discontinue support for some capabilities. As part of this review, no capabilities have been removed.

## Fixed issues

### Fixed Known issues

There are no fixed known issue in this version.

### Fixed security vulnerabilities

| Internal ID  | Case ID | CVE            | Description |
| ------------ | ------- | -------------- | ----------- |
| STREAMS-1616 | none    | CVE-2020-8231  | cURL vulnerability on Nginx image |
| STREAMS-1612 | none    | CVE-2020-28928 | Musl vulnerability on Nginx image |
| STREAMS-1611 | none    | CVE-2020-1971  | OpenSSL vulnerability on Nginx |
| STREAMS-1609 | none    | CVE-2020-8286  | cURL vulnerability on Nginx image |
| STREAMS-1608 | none    | CVE-2020-8285  | cURL vulnerability on Nginx image |
| STREAMS-1601 | none    | CVE-2020-1971  | OpenSSL vulnerability on MariaDB |
| STREAMS-1600 | none    | CVE-2020-1971  | OpenSSL vulnerability on Zookeeper |
| STREAMS-1599 | none    | CVE-2020-1971  | OpenSSL vulnerability on Kafka Third Party |
| STREAMS-1598 | none    | CVE-2020-1971  | OpenSSL vulnerability on Streams |
| STREAMS-1510 | none    | CVE-2020-28241 | Libmaxminddb vulnerability on Nginx image |
| STREAMS-1332 | none    | CVE-2020-24977 | libxml2 vulnerability on Nginx image |
| STREAMS-1332 | none    | CVE-2019-20633 | patch vulnerability on Nginx image |

## Known issues

The following are known issues for this update.

| Internal ID  | Case ID | Description |
| ------------ | ------- | ----------- |
| STREAMS-1546 | none    | Webhook subscription can receive data after its deletion |
| STREAMS-1544 | none    | Webhook subscription doesn't restart when Kafka/MariaDB reboot too quickly |
| STREAMS-1582 | none    | Warning logs at startup related to Kafka parameters |
| STREAMS-1582 | none    | Case sensitivity is different between keys and values in search expression |

## Known security vulnerabilities

| Internal ID  | Case ID | CVE            | Description |
| ------------ | ------- | -------------- | ----------- |
| STREAMS-1322 | none    |                | Default Access-Control-Allow-Origin config is unprotective |
| STREAMS-1540 | none    |                | AppSpider scans must also reference urls with existing topicId and subscriptionId |
| STREAMS-1397 | none    |                | No TLS connection between master and slave for MariaDB |
| STREAMS-1236 | none    |                | Kafka data-at-rest unencrypted |
| STREAMS-1644 | none    | CVE-2020-29361 | p11-kit vulnerability on Kafka image |
| STREAMS-1645 | none    | CVE-2020-29363 | p11-kit vulnerability on Kafka image |
| STREAMS-1646 | none    | CVE-2020-29362 | p11-kit vulnerability on Kafka image |
| STREAMS-1321 | none    | CVE-2019-17571 | Log4j-1.2.17 vulnerability on Kafka and Zookeeper images |
| STREAMS-1449 | none    | CVE-2020-27216 | Jetty vulnerability on Zookeeper image |
| STREAMS-1610 | none    | CVE-2020-27218 | Jetty vulnerability on Kafka image |
| STREAMS-1615 | none    | CVE-2020-27218 | Jetty vulnerability on Zookeeper image |
| STREAMS-1617 | none    | CVE-2020-8286  | cURL vulnerability on MariaDB image |
| STREAMS-1607 | none    | CVE-2020-8286  | cURL vulnerability on Kafka image |
| STREAMS-1613 | none    | CVE-2020-8286  | cURL vulnerability on Zookeeper image |

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

The following reference documents are also available:

* [Streams Security guide](https://docs.axway.com/bundle/Streams_20_SecurityGuide_allOS_en_HTML5/)

<!-- TODO Add links to Streams 3rd Party Librairies here-->

## Support services

The Axway Global Support team provides worldwide 24 x 7 support for customers with active support agreements.

Email [support@axway.com](mailto:support@axway.com) or visit Axway Support at <https://support.axway.com>.