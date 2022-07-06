---
title: Uninstalling
linkTitle: Uninstall
weight: 40
date: 2021-02-18
description: Learn how to uninstall Streams.
---

## Uninstall

To uninstall Streams, run following command:

```sh
export NAMESPACE="my-namespace"
export HELM_RELEASE_NAME="my-release"

helm uninstall "${HELM_RELEASE_NAME}" -n "${NAMESPACE}"
```

The command removes all the Kubernetes components associated with the chart and deletes the release.

Note that PersistentVolumeClaims required by Kafka and MariaDB are NOT deleted when the release is deleted. If you wish to delete them you can do it with the following command:

```sh
export NAMESPACE="my-namespace"

kubectl -n "${NAMESPACE}" get persistentvolumeclaims --no-headers=true | awk '/streams/{print $1}' | xargs kubectl delete -n "${NAMESPACE}" persistentvolumeclaims
```

Similarly, all [secrets](/docs/install/#secrets-management) created for the Streams release installation aren't deleted with the release uninstallation. To delete them, you can run the following command:

```sh
export NAMESPACE="my-namespace"
export HELM_RELEASE_NAME="my-release"

kubectl -n "${NAMESPACE}" delete secrets streams-docker-registry-secret streams-database-passwords-secret streams-database-secret streams-kafka-passwords-secret streams-kafka-client-jks-secret streams-subscriber-sse-jwt-secret central-auth-credentials streams-ingress-tls-secret
```

{{< alert title="Note" >}}Depending on your configuration, some of these secrets may not exist and the command will produce some harmless warning messages.{{< /alert >}}