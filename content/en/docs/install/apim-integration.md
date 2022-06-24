---
title: Secure Streams with API Management
linkTitle: Secure Streams with API Management
weight: 15
date: 2022-06-16
description: Use Amplify API Management to secure Streams APIs.
---

Follow this section to secure Streams APIs with [Amplify API Management](https://docs.axway.com/bundle/axway-open-docs/page/docs/api_mgmt_overview/index.html).

## Prerequisites

* Knowledge of [Policy Studio](https://docs.axway.com/bundle/axway-open-docs/page/docs/apim_policydev/index.html) development.
* You must have access to an API Management environment (Policy Studio, API Manager, API Gateway), and this environment must have access to the Streams cluster.
* Streams must be deployed with [Subscriber SSE Security](/docs/install/customize-install/#activate-subscriber-sse-security) feature enabled.
* You must have downloaded the Streams RBAC policies file (`streams-apim-rbac.xml`) and made it available to your Policy Studio.

## API Management configuration and deployment

The following sections describe how to configure API Management to integrate with Streams.

### Configure Policy Studio

Follow these steps to create and configure a project in Policy Studio:

1. Create a Project Configuration from an existing API Gateway instance.
2. Import Streams RBAC policies to Policy Studio using the **Import configuration fragment** button.
3. Select **Server Settings > API Manager** and configure policies as following:

    * `0- Streams RBAC request` and `0- Streams Access Token request` in **Request Policies**.
    * `0- Streams RBAC routing` in **Routing Policies**.
    * `0- Streams RBAC response` in **Response Policies**.

4. Save the configuration, and from the project homepage, deploy the configuration to the API Gateway instances.

### Configure API Manager

The following sections describe how to create and publish your APIs in API Manager.

#### Create Streams back-end APIs

Import Streams URLs as back-end APIs:

1. Click **API > Backend API > New API**.
2. Select **Swagger definition URL** as source, and complete the dialog box with the corresponding information.

| API Name               | URL                                                                |
|------------------------|--------------------------------------------------------------------|
| `Streams Hub`            | `https://<streams-cluster>/streams/hub/api/v1/openapi.yaml`          |
| `Streams Subscribers Kafka` | `https://<streams-cluster>/streams/subscribers/kafka/api/v1/openapi.yaml` |
| `Streams Subscribers Webhook` | `https://<streams-cluster>/streams/subscribers/webhook/api/v1/openapi.yaml` |
| `Streams Subscribers SSE` | `https://<streams-cluster>/streams/subscribers/sse/api/v1/openapi.yaml` |
| `Streams Subscribers SSE Auth` | `https://<streams-cluster>/streams/subscribers/sse/api/v1/openapi-auth.yaml` |

{{< alert title="Note" >}}Replace `<streams-cluster>` by the correct [streams hostname](docs/install/#ingress-hostname).{{< /alert >}}

#### Create Streams front-end APIs

Create your front-end APIs out of the back-end APIs.

1. Click **API > Frontend API > New API > New API from back-end API**.
2. For each back-end API, add the following information:

| Backend API Name           | Inbound tab                                                                | Outbound tab (Advanced view)            |
|----------------------------|----------------------------------------------------------------------------|   -------------|
| `Streams Hub`              | Inbound security: `API Key` ResourcePath: `/streams/hub/api/v1`| Request policy: `0- Streams RBAC request` Default method routing: `0- StreamsRBAC     routing` Response policy: `0- Streams RBAC response` |
| `Streams Subscribers Kafka` | Inbound security: `API Key` ResourcePath: `/streams/subscribers/kafka/api/v1` | Request policy: `0- Streams RBAC request` Default methodrouting:     `0- Streams RBAC routing` Response policy: `0- Streams RBAC response` |
| `Streams Subscribers Webhook` | Inbound security: `API Key` ResourcePath: `/streams/subscribers/webhook/api/v1` | Request policy: `0- Streams RBAC request` Defaultmethod     routing: `0- Streams RBAC routing` Response policy: `0- Streams RBAC response` |
| `Streams Subscribers SSE`  | Inbound security: `API Key` ResourcePath: `/streams/subscribers/sse/api/v1` | Request policy: `0- Streams RBAC request` Default method routing:`0-     Streams RBAC routing` Response policy: `0- Streams RBAC response` |
| `Streams Subscribers SSE Auth` | Inbound security: `API Key` ResourcePath: `/streams/subscribers/sse` | Request policy: `0- Streams RBAC Access Token request` Default method     routing: `API Proxy` Response policy: `leave field empty` |

#### Publish Streams front-end APIs

To publish your front-end APIs:

1. Click **API > Frontend API**.
2. Select all Streams front-end APIs checkboxes and click **Managed Selected > Publish**.

#### Create application and credentials

To create applications and credentials:

1. Click **Clients > Applications > New Application**.
2. In **Application > API Access** section, add All Streams Frontend APIs.
3. In **Authentication > API Keys** section, click **new API Key** to generate an API key.
4. Click **Save**.

Your Streams installation is now secured by API Manager.

## Verify installation

Verify that your Streams installation is working.

### Requirements

* You must have a valid API Key. Use the **keyId** previously created in your application.
* You must have the public API Gateway address.
* You must have the public address of the Streams Subscriber SSE user to consume SSE subscriptions.

To get started, open a terminal and set the following variables:

```bash
APIM_AUTHORIZATION_HEADER="KeyId: <YOUR_APPLICATION_KEY_ID>"
PUBLIC_API_GATEWAY_ADDRESS=<PUBLIC_API_GATEWAY_ADDRESS_WITH_STREAMS_CONFIGURATION>
PUBLIC_STREAMS_SUBSCRIBER_SSE_ADDRESS=<PUBLIC_STREAMS_SUBSCRIBER_SSE_ADDRESS_USE_TO_CONSUME_STREAMS_SSE_SUBSCRIPTION>
```

### Validate Streams Hub API

Use the following curl command to create a simple Streams topic:

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

If the configuration is correct, the returned HTTP code must be `2xx` and the response body must contain the Topic created.

### Validate Streams Subscribers SSE API

Create a minimal SSE subscription with the previously created Streams Topic:

```bash
curl -v -X POST "${PUBLIC_API_GATEWAY_ADDRESS}/streams/subscribers/sse/api/v1/topics/testTopic/subscriptions" \
-H 'Content-Type: application/json'  \
-H "${APIM_AUTHORIZATION_HEADER}"  \
--data-raw '{}'
```

If the configuration is correct, the returned HTTP code must be `2xx` and the JSON response must contain an **id** field. Use this ID as SUBSCRIPTION_ID.

```bash
SUBSCRIPTION_ID="<ID_RETURNED>"
```

The following two steps are required to consume a Streams SSE subscription:

1. Call the API Gateway to get a short-lived JWT token to access the Streams SSE Subscriber:

    ```bash
    curl -v -X GET "${PUBLIC_API_GATEWAY_ADDRESS}/streams/subscribers/sse/auth" \
    -H 'Content-Type: application/json' \
    -H "${APIM_AUTHORIZATION_HEADER}"
    ```

    If the configuration is correct, the returned HTTP code must be `2xx` and the JSON response must contain a **token** field. Use this field as SSE_JWT_TOKEN.

    ```bash
    SSE_JWT_TOKEN="<JWT_TOKEN_RETURNED>"
    ```

2. Call the Streams SSE Subscriber directly with the token previously generated as `Authorization Bearer` header:

    ```bash
    curl -v -X GET "${PUBLIC_STREAMS_SUBSCRIBER_SSE_ADDRESS}/streams/subscribers/sse/api/v1/subscriptions/${SUBSCRIPTION_ID}/subscribe" \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer ${SSE_JWT_TOKEN}"
    ```

    If the configuration is correct, the returned HTTP code must be `2xx` and the SSE stream should start receiving heartbeat events.

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

If the configuration is correct, the returned HTTP code must be `2xx` and the JSON response must contain an **id** field.

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

If the configuration is correct, the returned HTTP code must be `2xx` and the JSON response must contain an **id** field.

## Streams RBAC policies upgrade

To upgrade the Streams RBAC policies, download the new Streams RBAC policies file and proceed with a partial installation described in section, [Configure Policy Studio](/docs/install/apim-integration#cofigure-policy-studio).

In case of errors during the deployment of the new policies, proceed as follow:

* Unpublish and delete any Streams Front-end and back-end APIs in the API Manager.
* Perform a full installation of the new policies again.
