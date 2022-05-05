---
title: Integrate with Amplify Central Marketplace
linkTitle: Integrate with Amplify Central Marketplace
weight: 15
date: 2022-04-26
description: Connect Streams to Amplify Central and integrate with the Amplify Marketplace
---

Follow this section to integrate Streams with [Amplify Central](https://docs.axway.com/bundle/amplify-central/page/docs/index.html).

## Prerequisites

* You must know your Amplify Central organization ID.
* You must have an environment in which you wish to publish the Streams assets. To create a new one, go to Amplify Central [topology](https://apicentral.axway.com/topology/environments).
* You must have [a service account in Amplify Central](https://docs.axway.com/bundle/platform-management/page/docs/management_guide/organizations/managing_organizations/index.html#managing-service-accounts) with the following properties:
    * "Central Admin" in `Org Roles`
    * "Client Certificate" in `authentication`

## Create Kubernetes secret

Streams needs the certificates associated with your service account to authenticate to Amplify Central.
Create a secret containing those certificates:

```sh
export NAMESPACE="my-namespace"
export PRIVATE_KEY_PATH=""
export PUBLIC_KEY_PATH=""

kubectl -n "${NAMESPACE}" create secret generic central-auth-credentials \
    --from-file=private_key.pem="${PRIVATE_KEY_PATH}" \
    --from-file=public_key.pem="${PUBLIC_KEY_PATH}"
```

## Update your custom Helm values

Add your organization ID, your environment name, and the clientID associated to your service account to your custom Helm values for the installation:

```yml
discoveryAgent:
  enabled: true
central:
  organizationID: ""
  environment: ""
  auth:
    clientID: ""
```

You can then proceed with the installation.

If you have already installed Streams without enabling this integration, you can perform a Helm upgrade instead (don't forget to provide again your other custom values).