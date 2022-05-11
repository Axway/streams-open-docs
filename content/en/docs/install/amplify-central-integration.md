---
title: Integrate with Amplify Central Marketplace
linkTitle: Integrate with Amplify Central Marketplace
weight: 15
date: 2022-04-26
description: Connect Streams to Amplify Central to leverage tools like the Amplify Marketplace, where you can expose your Streams assets.
---

Follow this section to integrate Streams with [Amplify Central](https://docs.axway.com/bundle/amplify-central/page/docs/index.html).

## Prerequisites

* You must know your Amplify Central organization ID.
* You must have an environment in which you wish to publish the Streams assets. For more information on how to create a new environment, see [Connect and manage your environment](https://docs.axway.com/bundle/amplify-central/page/docs/connect_manage_environ/index.html).
* You must have [a service account in Amplify Central](https://docs.axway.com/bundle/platform-management/page/docs/management_guide/organizations/managing_organizations/index.html#managing-service-accounts) with the following configuration:
    * **Org Roles**: Central Admin
    * **Authentication method**: Client Certificate

## Create Kubernetes secret

Streams requires the certificates associated with your service account to authenticate to Amplify Central. The following is an example of how to create a secret containing those certificates:

```sh
export NAMESPACE="my-namespace"
export PRIVATE_KEY_PATH=""
export PUBLIC_KEY_PATH=""

kubectl -n "${NAMESPACE}" create secret generic central-auth-credentials \
    --from-file=private_key.pem="${PRIVATE_KEY_PATH}" \
    --from-file=public_key.pem="${PUBLIC_KEY_PATH}"
```

## Update your custom Helm values

Add your organization ID, your environment name, and the clientID associated to your service account to your custom Helm values for the installation. For example:

```yml
discoveryAgent:
  enabled: true
central:
  organizationID: ""
  environment: ""
  auth:
    clientID: ""
```

You Streams installation is now connected to Amplify Central.

You can [proceed with your Streams installation](/docs/install/#amplify-central-integration), or if you have already installed Streams without enabling this integration, you can perform a Helm upgrade instead. If upgrading the Helm chart, ensure to provide the same custom values you used for your original installation and that your Streams Helm chart contains the ``discoveryAgent`` section in its `values.yaml` file.
