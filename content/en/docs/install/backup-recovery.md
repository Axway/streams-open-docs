---
title: Backup and disaster recovery
linkTitle: Backup and disaster recovery
weight: 4
date: 2021-02-18
description: Learn how to perform regular backups of data and configurations and that can be used to recover from a disaster.
---

## Backup

It is essential for the smooth operation of Streams to perform regular backups of data and configurations. There are two kinds of data that we encourage you to back up:

* Configurations: Helm chart installation files - If you apply any modification to the default Streams helm chart, such as editing the values.yaml file, we recommend tracking the changes and back up the code in a source code repository. We recommend using git to address this point.
* Data: persistent volumes of Kubernetes services - We do not provide backup/restore procedures for volume data as it will mainly depend on your iPaaS. Nevertheless, you can have a look at stash project that enables the backup/restore of stateful applications (MariaDB, Kafka, Zookeeper) into AWS S3 buckets, for instance.

## Disaster recovery

For a disaster recovery procedure, you should have access to cloud resources in another region. Using backed-up configurations/data and Streams helm chart, you should be able to run a new installation in a new Kubernetes cluster in another region.

{{< alert title="Note" >}}The information provided in this section are only guidelines to help you implement your own disaster recovery procedure which needs to take into consideration your own constraints and environments. When disaster strikes, you must be prepared with a run book of specific actions to take that are proven to work, considering your specific environments.{{< /alert >}}