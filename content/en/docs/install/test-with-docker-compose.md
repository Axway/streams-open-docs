---
title: Test Streams with docker-compose
linkTitle: Test Streams with docker-compose
weight: 60
date: 2022-01-5
description: Learn how to test Streams using docker-compose.
---

Docker-compose allows to easily run Streams platform. It will allow you to test Streams locally without huge infrastructure prerequisites.

Docker-compose env is not aimed for production but only for tests.

## Prerequisites

* Docker 19.03.02+
* Docker-compose 1.17.1+
* Resources: at least `8` CPUs and `12` GB RAM

## Prepare your environment

After you have been onboarded on [Amplify Platform](https://platform.axway.com), you will be able to download our latest docker-compose archive from the **Downloads** section of the [Axway Support](https://support.axway.com/en/search/index/type/Downloads/sort/created%7Cdesc/ipp/10/product/596/version/3074) portal. Ensure to download the correct version of the Streams docker compose archive corresponding to the release you wish to test.

To prepare your environment, extract the docker compose archive and open a terminal from the extracted directory.

{{< alert title="Note" >}}You can find others resources in the [Axway Support](https://support.axway.com/en) portal, for example, Postman collections, OpenAPI, Docker-compose files and Helm chart, which can help you to configure your environment or test Streams.{{< /alert >}}

## Use Amplify Platform as your Docker registry

Docker images must be hosted in a docker registry accessible from your local computer. We recommend you to use the Amplify Platform repository for a custom docker registry. Alternatively, you can use [your own custom Docker registry](/docs/install/customize-install#use-a-custom-docker-registry).

To use the Amplify Platform as your container registry you must first ensure the following:

* You can see our images with your organization on the Amplify repository search page.
* You have administrator access to create a service account in your organization.

After you have verified that your images are loaded and that you have the correct level of access, you must create a service account, then create docker-registry secret with the information from your service account.

### Create a service account

To create your service account, perform the following steps:

1. Log in to the [Amplify Platform](https://platform.axway.com).
2. Select your organization, and from the left menu, click **Service Accounts** (You should see all service accounts already created).
3. Click **+ Service Account**, and fill in the mandatory fields:
    * Enter a name for the service account.
    * Choose `Client Secret` for the method.
    * Choose `Platform-generated secret` for the credentials.
4. Click **Save**
5. Ensure to securely store the generated client secret because it will be required in further steps.

### Log in to your Axway Repository

After creating your service account, run the following command to log in to axway repository:

```bash
export AXWAY_CLIENT_ID="<Client ID>"
export AXWAY_CLIENT_SECRET="<Client Secret>"

docker login repository.axway.com -u ${AXWAY_CLIENT_ID} -p ${AXWAY_CLIENT_SECRET}
```

## General conditions for license and subscription services

You hereby accept that the Axway Products and/or Services shall be governed exclusively by the Axway General Terms and Conditions located at [Axway General Conditions](https://cdn.axway.com/u/Axway_General_Conditions_version_april_2014_eng%20(France).pdf), unless an agreement has been signed with Axway in which case such agreement shall apply.

To accept them, you have to put the variable `STREAMS_ACCEPT_GENERAL_CONDITIONS=yes` in the `.env` file and proceed with the installation.

## Execute Docker compose to start Streams

To start Streams, run the following command:

```bash
docker-compose up -d
```

To ensure all the services are up and running, you can use `docker-compose ps` to check containers status.

```bash
Name                            Command                          State          Ports                                         
----------------------------------------------------------------------------------------------------------------------------------------------------------------------
streams-database                /opt/bitnami/scripts/maria ...   Up             0.0.0.0:3306->3306/tcp,:::3306->3306/tcp                                              
streams-hub                     bash scripts/wait-for-it.s ...   Up (healthy)   0.0.0.0:50001->50001/tcp,:::50001->50001/tcp, 0.0.0.0:9001->8080/tcp,:::9001->8080/tcp
streams-kafka                   /opt/bitnami/scripts/kafka ...   Up             0.0.0.0:29092->29092/tcp,:::29092->29092/tcp, 0.0.0.0:9092->9092/tcp,:::9092->9092/tcp
streams-prometheus              /opt/bitnami/prometheus/bi ...   Up             0.0.0.0:9090->9090/tcp,:::9090->9090/tcp                                              
streams-publisher-http-poller   bash scripts/entrypoint.sh       Up (healthy)   0.0.0.0:50002->50002/tcp,:::50002->50002/tcp, 0.0.0.0:9002->8080/tcp,:::9002->8080/tcp
streams-publisher-http-post     bash scripts/entrypoint.sh       Up (healthy)   0.0.0.0:50004->50004/tcp,:::50004->50004/tcp, 0.0.0.0:9004->8080/tcp,:::9004->8080/tcp
streams-publisher-sfdc          bash scripts/entrypoint.sh       Up (healthy)   0.0.0.0:50006->50006/tcp,:::50006->50006/tcp, 0.0.0.0:9006->8080/tcp,:::9006->8080/tcp
streams-subscriber-sse          bash scripts/entrypoint.sh       Up (healthy)   0.0.0.0:50000->50000/tcp,:::50000->50000/tcp, 0.0.0.0:9000->8080/tcp,:::9000->8080/tcp
streams-subscriber-webhook      bash scripts/wait-for-it.s ...   Up (healthy)   0.0.0.0:50003->50003/tcp,:::50003->50003/tcp, 0.0.0.0:9003->8080/tcp,:::9003->8080/tcp
streams-zookeeper               /opt/bitnami/scripts/zooke ...   Up             0.0.0.0:2181->2181/tcp,:::2181->2181/tcp, 2888/tcp, 3888/tcp, 8080/tcp    
```

## Automated Smoke test

To verify Streams is properly configured, launch the build-in smoke tests. The tests perform the following:

* Test the `Hub` API by creating a topic named `smoke-test-topic` using our public test API `https://stockmarket.streamdata.io/prices` and the `http-poller` publisher.
* Test the `SSE` subscription API by starting a subscription to the topic previously created.
* If everything works fine, the container will exit with code 0 otherwise an error will be displayed.

Run the following command to start the smoke tests:

```bash
docker-compose -f docker-compose.test.yml up
```

The following shows the output in case of success:

```bash
sut_1  | PUBLISHER_HTTP_POLLER_URL=http://streams-publisher-http-poller:8080
sut_1  | HUB_URL=http://streams-hub:8080
sut_1  | SUBSCRIBER_SSE_URL=http://streams-subscriber-sse:8080
sut_1  | TARGET_URL=http://stockmarket.streamdata.io/prices
sut_1  | TOPIC_CONFIG={ "name": "smoke-test-topic-5496", "publisher": {"type": "http-poller","config": {"url": "http://stockmarket.streamdata.io/prices","pollingPeriod": "PT1S"}}}
sut_1  |
sut_1  | Publisher.HTTP-Poller: UP
sut_1  |                   Hub: UP
sut_1  |        Subscriber.SSE: UP
sut_1  | 
sut_1  | Testing Hub topic creation API...
sut_1  | Successful topic creation: 1f5fe57c-0b83-415e-81c1-54707458b3c3
sut_1  | Testing SSE subscription to topic: 1f5fe57c-0b83-415e-81c1-54707458b3c3
sut_1  | Successful subscription to topic 1f5fe57c-0b83-415e-81c1-54707458b3c3 events 'snapshot,patch,patch,patch,patch,patch,patch,'
streams_sut_1 exited with code 0
```

## Stop Streams

To stop all services, execute the following command `docker-compose down`.