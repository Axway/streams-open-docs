---
title: Amplify Central integration
linkTitle: Amplify Central integration
weight: 15
date: 2022-04-26
description: Connect Streams to Amplify Central
---

Streams can connect to Amplify Central and integrate with the Amplify Marketplace. To enable this features, a few extra steps are needed.

## Setup Amplify Central

### Create a service account with a certificate

1. Log in to the [Amplify Platform](https://platform.axway.com).
2. Select your organization, and from the left menu, click **Service Accounts** (You should see all service accounts already created).
3. Click **+ Service Account**, and fill in the mandatory fields:
    * Enter a name for the service account.
    * Choose `Client Certificate` for the method.
    * Choose `Platform-generated key pair` for the credentials.
    * Choose `Central Admin` in Roles
4. Click **Save**
5. Download the generated private key: `private_key.pem`
6. You can now see the info of your service account displayed:
    * Save the `Client ID`
    * Copy/paste the public key into a `public_key.pem` file

### Gather your information

You will also want to know the following elements:

* Your organisation ID
* The environment in which you want to publish the Streams assets (see [topology](https://apicentral.axway.com/topology/environments))

## Setup Streams

## Kubernetes secret

Create a secret containing your certificates. If you have not renamed them, you can use the following snippet:

```sh
export NAMESPACE="my-namespace"
export CENTRAL_CERTIFICATES_PATH=<path-to-your-keys>

kubectl -n "${NAMESPACE}" create secret generic central-auth-credentials \
    --from-file=private_key.pem="${CENTRAL_CERTIFICATES_PATH}/private_key.pem" \
    --from-file=public_key.pem="${CENTRAL_CERTIFICATES_PATH}/public_key.pem"
```

## Helm values

Add the values from the previous sections to your custom Helm values for the installation:

```yml
discoveryAgent:
  enabled: true
central:
  organizationID: ""
  environment: ""
  auth:
    clientID: ""
```

If you are already running Streams in a compatible version, you can simply perform a Helm upgrade instead of a Helm install (don't forget to specify again all of your previous parameters and values).