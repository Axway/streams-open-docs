---
title: Upgrading
linkTitle: Upgrade
weight: 2
date: 2021-02-18
description: Learn how to upgrade your Streams installation with a new minor version or update your configuration.
---

## Upgrade

To upgrade your Streams installation with a new minor version or update your configuration:

* Check if there is any specific action to perform for the [current release](/docs/relnotes/)).
* (Optional) Update any of your `values.yaml` files with a custom configuration.

### Upgrade your Streams installation

```sh
export NAMESPACE="my-namespace"
export HELM_RELEASE_NAME="my-release"

helm upgrade "${HELM_RELEASE_NAME}" . [-f values.yaml] [-f values-ha.yaml] [--set key=value[,key=value]] -n "${NAMESPACE}"
```

{{< alert title="Caution" color="warning">}}Any difference in any of the `values.yaml` files or in the `--set` parameter from the initial installation will also be upgraded. So, if you initially installed Streams with `-f values.yaml` or `-f values-ha.yaml`, you have to specify the same parameters for the upgrade.
{{< /alert >}}

To avoid downtime during the upgrade, it is recommended to have at least `2` replicas of each pod before upgrading the Chart.

After an upgrade, a rollback is possible with the following command:

```sh
export NAMESPACE="my-namespace"
export HELM_RELEASE_NAME="my-release"

helm rollback "${HELM_RELEASE_NAME}" -n "${NAMESPACE}"
```