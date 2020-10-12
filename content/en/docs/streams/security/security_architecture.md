{
"title": "Security architecture",
"linkTitle": "Security architecture",
"weight": 30,
"date": "2020-10-08",
"description": "Architecture of Streams from a security perspective."
}

## Streams architecture

The following diagram shows the product architecture from a security perspective.

The legend explains the security level on connections (TLS by default, always TLS, can be TLS, and so on) and on data storage (signed or encrypted).

![Streams architecture and connection](/Images/security/sec_arch.png)

The diagram includes the following components:

* MariaDB: RDBMS use to persist topics and subscriptions
* Hazelcast: in-memory data cache, act as L2 cache of RDBMS and memory database
* Kafka: streaming backbone use for transformation on data pipeline
* Zookeeper: service registry used by Kafka
