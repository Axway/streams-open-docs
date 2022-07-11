---
title: Upgrade Streams
linkTitle: Upgrade
weight: 30
date: 2021-02-18
description: Learn how to upgrade your Streams installation with a new minor version or update your configuration.
---

To avoid downtime during Streams upgrade, it is recommended to have at least `2` replicas of each pod before upgrading the Chart.

{{< alert title="Caution" color="warning">}}Before any upgrade, you must back up your setup and your database. For more information, see the [Backup and disaster recovery](/docs/install/backup-recovery/) section.
{{< /alert >}}

## Prerequisites

* Check if there is any specific action to perform for the [current release](/docs/relnotes/).

## Upgrade your Streams installation

Run the following command to upgrade your Streams installation:

```sh
export NAMESPACE="my-namespace"
export HELM_RELEASE_NAME="my-release"

helm upgrade "${HELM_RELEASE_NAME}" . [-f values-ha.yaml] -f my-values.yaml  -n "${NAMESPACE}"
```

{{< alert title="Caution" color="warning">}}Any difference in any of the `values.yaml` files or in the `--set` parameter from the initial installation will also be upgraded. Therefore, if you initially installed Streams with `-f values.yaml` or `-f values-ha.yaml`, you must specify the same parameters for the upgrade.
{{< /alert >}}

## Rollback an upgrade

After an upgrade, you can perform a rollback by running the following command:

```sh
export NAMESPACE="my-namespace"
export HELM_RELEASE_NAME="my-release"

helm rollback "${HELM_RELEASE_NAME}" -n "${NAMESPACE}"
```