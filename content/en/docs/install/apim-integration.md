---
title: Secure Streams with API Management
linkTitle: Secure Streams with API Management
weight: 15
date: 2022-06-16
description: Use Amplify API Management to secure Streams APIs.
---

Follow this section to secure Streams APIs with [Amplify API Management](https://docs.axway.com/bundle/axway-open-docs/page/docs/api_mgmt_overview/index.html).

## Prerequisites

* knowledge of [Policy Studio development](https://docs.axway.com/bundle/axway-open-docs/page/docs/apim_policydev/index.html) is required
* You must have access to an API Management environment (Policy Studio, API Manager, API Gateway)
* This environment must have access to the Streams cluster.
* Streams must be deployed with [Subscriber SSE Security](/docs/install/customize-install/#activate-subscriber-sse-security) feature enabled.
* You must have downloaded the Streams RBAC policies file (streams-apim-rbac.xml) and made it available to your Policy Studio.

## API Management configuration and deployment

### In policy Studio

Create a Project Configuration from an existing API Gateway instance and import Streams RBAC policies in Policy Studio using the **import configuration fragment** button.
Select **Server Settings > API Manager** and configure policies as following:

* `0- Streams RBAC request` and `0- Streams Access Token request` in **Request Policies**
* `0- Streams RBAC routing` in **Routing Policies**
* `0- Streams RBAC response` in **Response Policies**

Save the configuration with the **Save** button and from the project homepage, deploy the configuration to the API Gateway instances using the **Deploy** button.

### In API Manager

#### Create Streams Backend APIs

Import the following Streams URLs as Backend APIs, click **API > Backend API > New API** button, then select **Swagger definition URL** as source and complete the dialog box with the corresponding information.

| API Name               | URL                                                                |
|------------------------|--------------------------------------------------------------------|
| `Streams Hub`            | `https://<streams-cluster>/streams/hub/api/v1/openapi.yaml`          |
| `Streams Subscribers Kafka` | `https://<streams-cluster>/streams/subscribers/kafka/api/v1/openapi.yaml` |
| `Streams Subscribers Webhook` | `https://<streams-cluster>/streams/subscribers/webhook/api/v1/openapi.yaml` |
| `Streams Subscribers SSE` | `https://<streams-cluster>/streams/subscribers/sse/api/v1/openapi.yaml` |
| `Streams Subscribers SSE Auth` | `https://<streams-cluster>/streams/subscribers/sse/api/v1/openapi-auth.yaml` |

{{< alert title="Note" >}}Replace `<streams-cluster>` by the correct [streams hostname](docs/install/#ingress-hostname).{{< /alert >}}

#### Create Streams Frontend APIs

Click on **API > Frontend API > New API > New API from backend API** button then for each backend API, fill the following information:

| Backend API Name           | Inbound tab                                                                | Outbound tab (Advanced view)                                                                                                    |
|----------------------------|----------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| `Streams Hub`              | Inbound security: `API Key` ResourcePath: `/streams/hub/api/v1`| Request policy: `0- Streams RBAC request` Default method routing: `0- Streams RBAC routing` Response policy: `0- Streams RBAC response` |
| `Streams Subscribers Kafka` | Inbound security: `API Key` ResourcePath: `/streams/subscribers/kafka/api/v1` | Request policy: `0- Streams RBAC request` Default method routing: `0- Streams RBAC routing` Response policy: `0- Streams RBAC response` |
| `Streams Subscribers Webhook` | Inbound security: `API Key` ResourcePath: `/streams/subscribers/webhook/api/v1` | Request policy: `0- Streams RBAC request` Default method routing: `0- Streams RBAC routing` Response policy: `0- Streams RBAC response` |
| `Streams Subscribers SSE`  | Inbound security: `API Key` ResourcePath: `/streams/subscribers/sse/api/v1` | Request policy: `0- Streams RBAC request` Default method routing: `0- Streams RBAC routing` Response policy: `0- Streams RBAC response` |
| `Streams Subscribers SSE Auth` | Inbound security: `API Key` ResourcePath: `/streams/subscribers/sse` | Request policy: `0- Streams RBAC Access Token request` Default method routing: `API Proxy` Response policy: `leave field empty` |

{{< alert title="Note" >}}Be sure to set correct Inbound/ResourcePath and Outbound policies for `Streams Subscribers SSE Auth`.{{< /alert >}}

#### Publish Streams Frontend APIs

Click on **API > Frontend API** toggle all Streams Frontend APIs checkboxes and click on **Managed Selected > Publish** button

#### Create application and credentials

Click on **Clients > Applications > New Application** button

* In **Application > API Access** section add All Streams Frontend APIs
* In **Authentication > API Keys** section click on the **new API Key** button to generate an API key

Click on the **Save** button. Your Streams installation is now secured by APIM.

## Verify installation

### Requirements

* You must have a valid *API Key*. Use the **keyId** previously created in your application
* You must have the *Public API Gateway address*
* You must have the *Public address of the Streams Subscriber SSE* use to consume SSE subscriptions

Open a terminal and set the following variables:

```bash
APIM_AUTHORIZATION_HEADER="KeyId: <YOUR_APPLICATION_KEY_ID>"
PUBLIC_API_GATEWAY_ADDRESS=<PUBLIC_API_GATEWAY_ADDRESS_WITH_STREAMS_CONFIGURATION>
PUBLIC_STREAMS_SUBSCRIBER_SSE_ADDRESS=<PUBLIC_STREAMS_SUBSCRIBER_SSE_ADDRESS_USE_TO_CONSUME_STREAMS_SSE_SUBSCRIPTION>
```

### Validate Streams Hub API

Use the following curl command to create a simple Streams Topic:

```bash
curl -v -X POST "${PUBLIC_API_GATEWAY_ADDRESS}/streams/hub/api/v1/topics" \
-H 'Content-Type: application/json'  \
-H "${APIM_AUTHORIZATION_HEADER}"  \
--data-raw '{
   "name": "testTopic",
   "publisher": {
      "type": "http-post",
      "payload": {
         "type": "event"
      }
   },
   "subscribers":[
     { "type" : "sse" },
     { "type" : "kafka" },
     { "type" : "webhook" }
    ] 
}
'
```

If the configuration is correct, the returned HTTP code must be 2xx and the response body must contain the Topic created.

### Validate Streams Subscribers SSE API

Create a minimal SSE subscription with the previously created Streams Topic:

```bash
curl -v -X POST "${PUBLIC_API_GATEWAY_ADDRESS}/streams/subscribers/sse/api/v1/topics/testTopic/subscriptions" \
-H 'Content-Type: application/json'  \
-H "${APIM_AUTHORIZATION_HEADER}"  \
--data-raw '{}'
```

If the configuration is correct, the returned HTTP code must be 2xx and the JSON response must contain a field **id**. Use this id as SUBSCRIPTION_ID.

```bash
SUBSCRIPTION_ID="<ID_RETURNED>"
```

Two steps are required to consume a Streams SSE subscription:

* Call the API Gateway to get a short-lived JWT token to access the Streams SSE Subscriber:

    ```bash
    curl -v -X GET "${PUBLIC_API_GATEWAY_ADDRESS}/streams/subscribers/sse/auth" \
    -H 'Content-Type: application/json' \
    -H "${APIM_AUTHORIZATION_HEADER}"
    ```

    If the configuration is correct, the returned HTTP code must be 2xx and the JSON response must contain a field **token**. Use this field as SSE_JWT_TOKEN.

    ```bash
    SSE_JWT_TOKEN="<JWT_TOKEN_RETURNED>"
    ```

* Call directly the Streams SSE Subscriber with the token previously generated as `Authorization Bearer` header:

    ```bash
    curl -v -X GET "${PUBLIC_STREAMS_SUBSCRIBER_SSE_ADDRESS}/streams/subscribers/sse/api/v1/subscriptions/${SUBSCRIPTION_ID}/subscribe" \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer ${SSE_JWT_TOKEN}"
    ```

    If the configuration is correct, the returned HTTP code must be 2xx and the SSE stream should start receiving heartbeat events `:`.

### Validate Streams Subscribers Webhook API

Create a minimal Webhook subscription with the previously created Streams Topic. Set the mandatory field `webhookUrl` in the request body:

```bash
curl -v -X POST "${PUBLIC_API_GATEWAY_ADDRESS}/streams/subscribers/webhook/api/v1/topics/testTopic/subscriptions" \
-H 'Content-Type: application/json'  \
-H "${APIM_AUTHORIZATION_HEADER}"  \
--data-raw '{
   "webhookUrl": "<YOUR_WEBHOOK_ENDPOINT_URL>"
}'
```

If the configuration is correct, the returned HTTP code must be 2xx and the JSON response must contain a field **id**.

### Validate Streams Subscribers Kafka API

Create a minimal Kafka subscription with the previously created Streams Topic. Set mandatory fields `kafkaBootstrapServers` and `kafkaTopic` in the request body:

```bash
curl -v -X POST "${PUBLIC_API_GATEWAY_ADDRESS}/streams/subscribers/kafka/api/v1/topics/testTopic/subscriptions" \
-H 'Content-Type: application/json'  \
-H "${APIM_AUTHORIZATION_HEADER}"  \
--data-raw '{
   "kafkaBootstrapServers": "<YOUR_KAFKA_SERVERS>",
   "kafkaTopic": "<YOUR_KAFKA_TOPIC>"
}'
```

If the configuration is correct, the returned HTTP code must be 2xx and the JSON response must contain a field **id**.

## Streams RBAC Policies Upgrade

To upgrade the Streams RBAC policies, download the new Streams RBAC Policies file and proceed with a partial installation described in chapter [In Policy Studio](/docs/install/apim-integration#in-policy-studio)

In case of errors during the deployment of the new policies, proceed as follow:

* Unpublish and delete any Streams FrontEnd/Backend APIs in the API Manager.
* Do a full installation of the new policies as described in chapter [API Management configuration and deployment](/docs/install/apim-integration#api-management-configuration-and-deployment)
