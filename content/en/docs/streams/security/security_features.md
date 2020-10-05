---
title: Security features
linkTitle: Security features
weight: 30
date: 2020-09-18
description: Summary of the main security features of Streams.
---

## Secure connections

The following secure connections are available:

* All inbound connections to Streams are SSL-secured by default.
* All outbound connections made by Streams to destination endpoints can be verified to ensure that a trusted certificate is used.
* Connections between Streams microservice and database can be SSL-secured.
* Connections between Streams microservice and Kafka can be SSL-secured.
* Connections to other Axway products (for example, Axway API Gateway) can be SSL-secured.

## Secure storage

* Streams Database columns likely to contain sensitive authentication information to external component (e.g. Publisher configuration, Headers values) are stored encrypted in database.
* All sensitive Streams configuration items (e.g. MariaDB passwords) are stored in [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/) by default which can be used in conjunction with a [Key Management Service](https://kubernetes.io/docs/tasks/administer-cluster/kms-provider/) (KMS) to enable secret data encryption.
