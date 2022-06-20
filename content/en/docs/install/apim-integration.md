---
title: Integrate with APIM
linkTitle: Integrate with APIM
weight: 15
date: 2022-06-16
description: Use Amplify API Management to secure Streams Subscribers APIs.
---

Follow this section to secure Streams Subscribers API with [Amplify API Management](https://docs.axway.com/bundle/axway-open-docs/page/docs/apim_administration/index.html).

## Prerequisites

* You must have access to an APIM environment (Policy Studio, API Manager, API Gateway)
* This environment must have access to the Streams cluster.
* Streams must be deployed with [Subscriber SSE Security](/docs/install/customize-install/#activate-subscriber-sse-security) feature enabled.

## In policy Studio

Create a Project Configuration from an existing API Gateway instance and import Streams APIM RBAC policies (streams-apim-rbac.xml) in Policy Studio using the **import configuration fragment** button.
Select **Server Settings > API Manager** and configure policies as following:

* *0- Streams RBAC request* and *0- Streams Access Token request* in **Request Policies**
* *0- Streams RBAC routing* in **Routing Policies**
* *0- Streams RBAC response* in **Response Policies**

Deploy the created configuration to the API Gateway instances using the **Deploy** button

## In API Manager

### Create Streams Backend APIs

Import the following Streams URLs as Backend APIs, click **API > Backend API > New API** button, then choose **Swagger definition URL** as source and fill the following information.

| API Name               | URL                                                                |
|------------------------|--------------------------------------------------------------------|
| `Streams Hub`            | `https://<streams-cluster>/streams/hub/api/v1/openapi.yaml`          |
| `Streams Subscribers Kafka` | `https://<streams-cluster>/streams/subscribers/kafka/api/v1/openapi.yaml` |
| `Streams Subscribers Webhook` | `https://<streams-cluster>/streams/subscribers/webhook/api/v1/openapi.yaml` |
| `Streams Subscribers SSE` | `https://<streams-cluster>/streams/subscribers/sse/api/v1/openapi.yaml` |
| `Streams Subscribers SSE Auth` | `https://<streams-cluster>/streams/subscribers/sse/api/v1/openapi-auth.yaml` |

{{< alert title="Note" >}}Replace `<streams-cluster>` by the correct streams cluster address.{{< /alert >}}

### Create Streams Frontend APIs

Click on **API > Frontend API > New API > New API from backend API** button then for each backend API, fill the following information:

| Backend API Name           | Inbound tab                                                                | Outbound tab (Advanced view)                                                                                                    |
|----------------------------|----------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| `Streams Hub`              | Inbound security: `API Key` ResourcePath: `/streams/hub/api/v1`| Request policy: `0- Streams RBAC request` Default method routing: `0- Streams RBAC routing` Response policy: `0- Streams RBAC response` |
| `Streams Subscribers Kafka` | Inbound security: `API Key` ResourcePath: `/streams/subscribers/kafka/api/v1` | Request policy: `0- Streams RBAC request` Default method routing: `0- Streams RBAC routing` Response policy: `0- Streams RBAC response` |
| `Streams Subscribers Webhook` | Inbound security: `API Key` ResourcePath: `/streams/subscribers/webhook/api/v1` | Request policy: `0- Streams RBAC request` Default method routing: `0- Streams RBAC routing` Response policy: `0- Streams RBAC response` |
| `Streams Subscribers SSE`  | Inbound security: `API Key` ResourcePath: `/streams/subscribers/sse/api/v1` | Request policy: `0- Streams RBAC request` Default method routing: `0- Streams RBAC routing` Response policy: `0- Streams RBAC response` |
| `Streams Subscribers SSE Auth` | Inbound security: `API Key` ResourcePath: `/streams/subscribers/sse` | Request policy: `0- Streams RBAC Access Token request` Default method routing: `API Proxy` Response policy: `leave field empty` |

{{< alert title="Note" >}}Be sure to set correct Inbound/ResourcePath and Outbound policies for `Streams Subscribers SSE Auth`.{{< /alert >}}

### Publish Streams Frontend APIs

click on **API > Frontend API** toggle all Streams Frontend APIs checkboxes and click on **Managed Selected > Publish** button

### Create application and credentials

Click on **Clients > Applications > New Application** button, fill the required information.

* In **Application > API Access** section add All Streams Frontend APIs
* In **Authentication > API Keys** section click on the **new API Key** button to generate a new API key

You Streams installation is now secured by APIM.