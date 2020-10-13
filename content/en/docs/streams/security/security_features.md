---
title: Security features
linkTitle: Security features
weight: 20
date: 2020-09-18
description: Summary of the main security features of Streams.
---

## Secure connections

The following secure connections are available:

* All inbound connections to Streams are TLS-secured by default.
* All outbound connections made by Streams to destination endpoints are verified by default to ensure that a trusted certificate is used.
* Connections between Streams microservice and database is TLS-secured by default.
* Connections to other Axway products (for example, Axway API Gateway) can be TLS-secured.

## Encrypted data-at-rest

* Kubernetes secrets data can be encrypted at rest. Raw encryption key can be stored within a KMS provider.
* Encrypted data-at-rest is enabled by default for MariaDB.

## Password management

* Passwords for hazelcast and MariaDB are managed via kubernetes secrets.  
* A keyfile is required to enable data-at-rest encryption on MariaDB.

## Certificate management

* A CA certificate, server certificate and server key are required for TLS communication between Streams and the MariaDB.
* SSL/TLS certificate is required for TLS communication on the ingress.
* Certificates are stored and managed via kubernetes secrets.
