---
title: Integrate with APIM
linkTitle: Integrate with APIM
weight: 15
date: 2022-06-16
description: Use Amplify API Management to secure Streams Subscribers APIs.
---

Follow this section to secure Streams Subscribers API with [Amplify API Management](https://docs.axway.com/bundle/axway-open-docs/page/docs/api_mgmt_overview/index.html).

## Prerequisites

* You must have access to an APIM environment (Policy Studio, API Manager, API Gateway)
* This environment must have access to the Streams cluster.
* Streams must be deployed with [Subscriber SSE Security](/docs/install/customize-install/#activate-subscriber-sse-security) feature enabled.
* You must have downloaded the Streams APIM RBAC policies file and made it available to your Policy Studio.

## Configuration and deployment

### In policy Studio

Create a Project Configuration from an existing API Gateway instance and import Streams APIM RBAC policies (streams-apim-rbac.xml) in Policy Studio using the **import configuration fragment** button.
Select **Server Settings > API Manager** and configure policies as following:

* *0- Streams RBAC request* and *0- Streams Access Token request* in **Request Policies**
* *0- Streams RBAC routing* in **Routing Policies**
* *0- Streams RBAC response* in **Response Policies**

Deploy the created configuration to the API Gateway instances using the **Deploy** button

### In API Manager

#### Create Streams Backend APIs

Import the following Streams URLs as Backend APIs, click **API > Backend API > New API** button, then choose **Swagger definition URL** as source and fill the following information.

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

click on **API > Frontend API** toggle all Streams Frontend APIs checkboxes and click on **Managed Selected > Publish** button

#### Create application and credentials

Click on **Clients > Applications > New Application** button, fill the required information.

* In **Application > API Access** section add All Streams Frontend APIs
* In **Authentication > API Keys** section click on the **new API Key** button to generate a new API key

You Streams installation is now secured by APIM.

## Verify installation

To access Streams APIs, an Authorization header must be provided. The format depends on the Security profile chosen during the Frontend creation:

* For `OAuth` Security Profile

  Use the **client_id** and **client_secret** created in your application

  ```bash
  curl -X POST '<API_GATEWAY_INGRESS>/api/oauth/token' \
  --data-raw 'grant_type=client_credentials&client_id=<APP_CLIENT_ID>&client_secret=<APP_CLIENT_SECRET>'
  ```

  This should return a JSON containing a field **access_token** that need to be used as Authorization Bearer header like this:

  ```bash
  AUTHORIZATION_HEADER="Authorization: Bearer <ACCESS_TOKEN_RETURNED>"
  ```
* For `API Key` Security Profile

  Use the **keyId** created in your application and set the following env variable:

  ```bash
  AUTHORIZATION_HEADER="KeyId: <KEY_ID_RETURNED>"
  ```

### Validate Streams Hub API

Use the following curl command to create a simple Streams Topic. This should return a JSON containing the Topic created

```bash
curl -X POST '<API_GATEWAY_INGRESS>/streams/hub/api/v1/topics' \
-H 'Content-Type: application/json'  \
-H '${AUTHORIZATION_HEADER}'  \
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

### Validate Streams Subscribers SSE API

Create a minimal SSE subscription with the previously created Streams Topic. This will return a JSON containing a field **id**. Use this id as SUBSCRIPTION_ID

```bash
curl -X POST '<API_GATEWAY_INGRESS>/streams/subscribers/sse/api/v1/topics/testTopic/subscriptions' \
-H 'Content-Type: application/json'  \
-H '${AUTHORIZATION_HEADER}'  \
--data-raw '{}'
```

Generate the JWT Token required to consume the previously created SSE subscription. This should return a JSON containing a field **token** with the JWT token

```bash
curl -X GET '<API_GATEWAY_INGRESS>/streams/subscribers/sse/auth' \
-H 'Content-Type: application/json' \
-H '${AUTHORIZATION_HEADER}'
```

Store this token in env variable

```bash
SSE_JWT_TOKEN="<JWT_TOKEN_RETURNED>"
```

Consume the SSE subscription using the JWT Token previously generated as Authorization Bearer header in the following call

```bash
curl -X GET '<PUBLIC_STREAMS_SSE_INGRESS>/streams/subscribers/sse/api/v1/subscriptions/<SUBSCRIPTION_ID>/subscribe' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer ${SSE_JWT_TOKEN}'
```

### Validate Streams Subscribers Webhook API

Create a minimal Webhook subscription with the previously created Streams Topic. A field is mandatory `webhookUrl`. This will return a JSON containing a field **id**. Use this id as SUBSCRIPTION_ID

```bash
curl -X POST '<API_GATEWAY_INGRESS>/streams/subscribers/webhook/api/v1/topics/testTopic/subscriptions' \
-H 'Content-Type: application/json'  \
-H '${AUTHORIZATION_HEADER}'  \
--data-raw '{
   "webhookUrl": "<YOUR_WEBHOOK_ENDPOINT_URL>"
}'
```

### Validate Streams Subscribers Kafka API

Create a minimal Kafka subscription with the previously created Streams Topic. Fields are mandatory `kafkaBootstrapServers` and `kafkaTopic`. This will return a JSON containing a field **id**. Use this id as SUBSCRIPTION_ID

```bash
curl -X POST '<API_GATEWAY_INGRESS>/streams/subscribers/kafka/api/v1/topics/testTopic/subscriptions' \
-H 'Content-Type: application/json'  \
-H '${AUTHORIZATION_HEADER}'  \
--data-raw '{
   "kafkaBootstrapServers": "<YOUR_KAFKA_SERVERS>",
   "kafkaTopic": "<YOUR_KAFKA_TOPIC>"
}'
```

## Streams RBAC Policies Upgrade

Most of the time, to upgrade the Streams RBAC policies, you just have to download the new Streams RBAC Policies file and proceed with a partial installation described in chapter [In Policy Studio](/docs/install/apim-integration#in-policy-studio)

In case of error during the deployment of the new policies proceed as following:

* Unpublish and delete any Streams FrontEnd/Backend APIs in the API Manager.
* Do a full installation of the new policies as described in chapter [Configuration and deployment](/docs/install/apim-integration#configuration-and-deployment)
