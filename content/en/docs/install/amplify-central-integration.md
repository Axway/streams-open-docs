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
* You must be authenticated with [Axway-cli](https://docs.axway.com/bundle/amplify-central/page/docs/integrate_with_central/cli_central/cli_install/index.html).
* You must know your API Gateway base URL.
* You must know your API Manager host (port).
* You must know the public base URL of the Streams SSE subscriber.

## Create your Kubernetes secret

Streams requires the certificates associated with your service account to authenticate to Amplify Central. The following is an example of how to create a secret containing those certificates:

```sh
export NAMESPACE="my-namespace"
export PRIVATE_KEY_PATH=""
export PUBLIC_KEY_PATH=""

kubectl -n "${NAMESPACE}" create secret generic central-auth-credentials \
    --from-file=private_key.pem="${PRIVATE_KEY_PATH}" \
    --from-file=public_key.pem="${PUBLIC_KEY_PATH}"
```

## Create your Axway Central secret

You must include your API Manager credentials into a *secret* resource in Amplify Central.

Create and customize the following YAML file (`streams-apimanager-secret.yaml`) with your own values:

```yml
group: "management"
apiVersion: "v1alpha1"
kind: "Secret"
name: "streams-apimanager-secret"
title: "APIManager credentials secret for Streams"
metadata:
  scope:
    kind: "Environment"
    name: "<CHANGE_WITH_YOUR_ENVIRONMENT_NAME>"
spec:
  data:
    authUsername : "<CHANGE_WITH_YOUR_USERNAME>"
    authPassword: "<CHANGE_WITH_YOUR_PASSWORD>"
```

Provide Amplify Central with this *Secret* resource:

```sh
axway central create -f ./streams-apimanager-secret.yaml
```

## Update your custom Helm values

Add the following values to your custom Helm values for the installation.

* Your organization ID
* Your environment name
* The clientID associated to your service account
* The API Gateway URL
* The API Manager port
* The public Streams SSE subscriber URL

 For example:

```yml
discoveryAgent:
  enabled: true
  apigateway:
    baseURL: ""
  apimanager:
    host: ""
    port: 8075
  subscriberSSE:
    publicBaseURL: ""
central:
  organizationID: ""
  environment: ""
  auth:
    clientID: ""
```

You Streams installation is now connected to Amplify Central.

You can [proceed with your Streams installation](/docs/install/#amplify-central-integration), or if you have already installed Streams without enabling this integration, you can perform a Helm upgrade instead. If upgrading the Helm chart, ensure to provide the same custom values you used for your original installation and that your Streams Helm chart contains the ``discoveryAgent`` section in its `values.yaml` file.
