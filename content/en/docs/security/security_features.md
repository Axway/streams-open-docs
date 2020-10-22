---
title: Security features
linkTitle: Security features
weight: 2
date: 2020-09-18
description: Summary of the main security features of Streams.
---

## Secure connections

The following secure connections are available:

* All inbound connections to Streams are TLS-secured by default.
* All outbound connections made by Streams to destination endpoints can be verified to ensure that a trusted certificate is used.
* Connections between Streams micro services and database can be TLS-secured.
* Connections to other Axway products (e.g. Axway API Gateway) can be TLS-secured.

## Secure storage

* Streams relies on Transparent Data Encryption (TDE) to provide [data-at-rest encryption](https://mariadb.com/kb/en/data-at-rest-encryption-overview/) for all objects stored in database.
* All sensitive Streams configuration items (e.g. MariaDB passwords) are stored in [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/) by default which can be used in conjunction with a [Key Management Service](https://kubernetes.io/docs/tasks/administer-cluster/kms-provider/) (KMS) to enable secret data encryption.
