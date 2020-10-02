---
title: Streams Reference Architecture
linkTitle: Reference Architecture
weight: 6
date: 2020-09-18
description: Install Streams and learn how to upgrade an existing installation.
---

## Summary

This document provides a reference architecture guide for deploying Streams. Deploying Streams using Docker containers orchestrated by Kubernetes brings tremendous benefits in installing, developing and operating the solution.
This document describes all major areas in deploying and maintaining Streams, including:

* Physical and deployment architectures.
* Explanation and consideration for selecting underlying infrastructure components.
* Kubernetes considerations.
* Performance, logging and monitoring aspects.
* Backup and recovery, including disaster recovery.

## Overview

Streams is an event hub that makes it easy to exchange messages between devices, services and applications. It only supports container-based deployment. The purpose of this document is to share Axway reference architecture for the container-based deployment of a Streams solution on Kubernetes. It will address many architectural, development and operational aspects of the proposed architecture.  
Because the technology chosen, Docker and Kubernetes, are portable across on-premises environments and many cloud providers, most of the information in this guide should apply to those environments. But we include specific recommendations for AWS as one of the most common deployment targets.
The target audience for the document is architects, developers, and operations personnel. To get the most value from this document, a reader should have a good knowledge of Docker, Kubernetes and API.

## General Architecture

This chapter is focused on general architecture in support of a Streams deployment on a dedicated Kubernetes cluster. The chapter discusses architectural principles, as well as required and optional components. There are many ways to deploy software on a Kubernetes cluster, but this document shares Axway’s experience acquired from deploying Streams in an actual production environment. Most of the implementation details will be outlined in the following chapters.
Make sure the constraints listed in the chapters are respected in case of deployment on an existing Kubernetes cluster.

### Principles

Official testing is taking place in Kubernetes as the orchestration component. However, the Docker images are platform agnostic, so they can be deployed in other orchestration platforms, or even on docker-compose although it is not recommended to use beside testing purposes. Kubernetes manages many important aspects of runtime, security, and operations.
Besides Docker and Kubernetes, we use Helm charts to describe the entire deployment configuration. Using Helm provides an efficient way to package all configuration parameters for Kubernetes and Streams containers to be deployed with a single command.

Using Helm, you can:

* Alter default resources configuration (CPU / memory)
* Select which components to deploy
* Set up container-based configuration

In this guide, we will show which configurations can be changed and how to change them.

In generic terms Streams is deployed as a stack of three layer with different responsibilities.

![Layered Architecture](/Images/architecture/arch_layered_deployment.png)

To help customers with setting up a required environment, the following table describes the required and recommended options.

| Description                   | Required? |
| ----------------------------- | --------- |
| A storage system with the capacity to store dedicated data and to share data between components | Required |
| A bastion for administration tasks on Streams and Kubernetes | Recommended |
| Kubernetes can pull Docker images from a Docker repository | Required |
| Docker images are pulled from a private proxy repository | Recommended |

### Target use case

We review a single deployment option where all Streams components including their dependencies are running inside a single Kubernetes cluster.
In our scenario, we expose several entry points for the external clients inside the cluster (see implementation details).  
A dedicated deployment environment requires:

* A Kubernetes cluster
* A Storage system  
* An Access to Streams docker images in container registry

The following diagram shows a general architecture of a single cluster configuration:

![Components overview Architecture](/Images/architecture/arch_components_overview.png)

### Additional components and considerations

In this section, we present the considerations for using additional components in the single cluster architecture.

#### Container proxy registry

In order to avoid your Kubernetes cluster to directly access internet, we recommend to use self-managed docker registry proxy (e.g., Sonatype Nexus, JFrog Artifactory). This proxy can thus be configured to access Streams images repository managed by Axway.

| Description                   | Type      |
| ----------------------------- | --------- |
| Docker images contain such sensitive data as certificate, and configuration. This data must be protected | Required |
| The password is sensitive and must be encrypted in the system | Required |

#### Bastion host

Administrative tasks should be executed safely. We recommend you to use a bastion host to bridge to the following instances via the internet:

* Kubernetes master nodes for managing a cluster
* Kubernetes Dashboard
* RBDMS and Kafka
* Debugging any issue with a Kubernetes cluster

The bastion must have high traceability with specific RBAC permissions to allow a few selected users to access infrastructure components.

#### Storage capabilities

Platform infrastructure must support Kubernetes PersistentVolumes. See [Volumes](#volumes) section for details.

#### Encrypting secret data at rest

To improve security, you should encrypt k8s secret data at rest. See [Encrypting Secret Data at Rest](https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data) for more details.

{{< alert title="Warning" color="warning" >}} We strongly recommend you to use a KMS provider instead of storing the raw encryption key in the `EncryptionConfig` file. Encrypting secrets with a locally managed key protects against an `etcd` compromise, but it fails to protect against a host compromise. Since the encryption keys are stored on the host in the `EncryptionConfig` YAML file, a skilled attacker can access that file and extract the encryption keys.{{< /alert >}}

### Performance goals

An important factor for achieving your goals is to define a set of performance goals. These will be unique for a specific set of APIs, deployment platform and clients’ expectations. Later in the document, we show an example of the performance metrics that have been achieved in testing a reference architecture.

## Implementation details

This chapter details the configuration for each component.

### Diagram

Diagram below shows the recommended reference architecture diagram. It is designed with High Availability (HA) in mind. An HA deployment requires redundancy and high throughput for all infrastructure components and networks. To reach this target, components must be deployed in multiple zones. If your K8s cluster is well-configured, the pods are spread across the zones in a best effort placement. In order to reduce the probability of unequal spreading across zones, it is recommended to use homogenous zone (same number and type of nodes) as designed in this architecture. In our configuration, we use three availability zones. This configuration is compliant with a minimal technical SLA of 99.99 percent. The implementation details of this diagram are explained in this chapter.

![Technical diagram for HA deployment](/Images/architecture/arch_technical_deployment_ha.png)

### Choice of runtime infrastructure components

This section provides recommendations for a typical implementation of the runtime infrastructure components.
In this configuration, all assets of the Kubernetes cluster are deployed in the same data center or a region (in case of a cloud deployment), although components are spread out in various racks, rooms or availability zones.
The following table lists the number of runtime components in this configuration.

| Assets                  | Spec                           |
| ----------------------- | ------------------------------ |
| Master nodes            | 3 (one per availability zones) |
| Worker nodes            | 6 (two per availability zones) |
| Dedicated storage       | 632GB                          |
| External IP             | 1                              |
| Load Balancer           | 1                              |

These values are the minimum recommended starting point. Your actual values will depend on many factors such as the number of topics, payload size, etc. Use recommendations as the starting point for your own project. Then run through a series of functional and performance tests to adjust your settings.

#### VM configurations

These are the recommended parameters for the VMs:

| Assets       | CPU | RAM   |
| ------------ | --- | ----- |
| Master nodes | 2   | 8 GB  |
| Worker nodes | 16  | 32 GB |

#### Storage

We recommend using SSD disks with low latency. The storage is used by the Kafka, Zookeeper and PostgreSQL pods. The following table summarizes the minimum recommended storage for each component, but your configuration will depend on your usage and other parameters.

| Component  | Size per pod |
| ---------- | ------------ |
| PostgreSQL | 8 GB         |
| Kafka      | 200 GB       |
| Zookeeper  | 8 GB         |

### Load balancer

A load balancer is required in front of the cluster. We use the Kubernetes object called ingress controller that is responsible for fulfilling the ingress rules. A Nginx ingress controller is, by default, deployed with our Helm chart installation. For better performance, we recommend you to use a L4 Load balancer. See your Cloud provider documentation to configure it (e.g. [AWS Load Balancing](https://docs.aws.amazon.com/eks/latest/userguide/load-balancing.html))

#### Network

The network deployment uses only one subnet per availability zone. Each subnet must be protected by a firewall with appropriate inbound and outbound rules. The following table describes these rules.

| ID  | Description                                    | From              | To                | Protocol | Ports  |
| --- | ---------------------------------------------- | ----------------- | ----------------- | -------- | ------ |
| 1   | Connection from internet/intranet              | Internet/Intranet | Load Balancer     | TCP      | 80,443 |
| 2   | Connection to the K8s cluster                  | Load balancer     | All subnets       | TCP      | 443    |
| 3   | Communication between K8s nodes                | All subnets       | All subnets       | UDP/TCP  | *      |
| 4   | Egress to pull Docker images                   | All subnets       | Internet/Intranet | TCP      | 443    |
| 5   | Egress to connect to topics endpoints          | All subnets       | Internet/Intranet | TCP      | 80,443 |

### Time synchronization

For security and maintenance reason, it is strongly recommended to time synchronize your Kubernetes pods thanks to the Network Time Protocol (NTP). Pods use the clock of the node they are running on, so you need to time synchronize the nodes of your Kubernetes cluster.
On AWS, it is recommended to use the chrony client to synchronize your Linux instances (for details refer to [AWS Set time guide](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/set-time.html)).

### Kubernetes considerations

This section focuses on additional Kubernetes objects and configuration inside the cluster to support Axway components. This is a required step before deploying containers.

#### Deployment options

Some parameters are available only at the creation of the Kubernetes cluster. The first is a network manager for communication between pods and the second is a set of strong permissions for Kubernetes.

##### Network plugin

Streams does not require any specific network CNI. Nevertheless, it quickly becomes more convenient (e.g. if you want to create ingress/egress network policies) or mandatory when deploying on cloud providers (e.g., deployment on internal network topology).
We recommend the use of [CALICO](https://kubernetes.io/docs/concepts/cluster-administration/networking/#project-calico) with default configuration. The [AWS VPC CNI](https://kubernetes.io/docs/concepts/cluster-administration/networking/#aws-vpc-cni-for-kubernetes) has also been validated with our platform.

##### RBAC Permission

Kubernetes Role-based access control ([RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/)) is a method of regulating access to your Kubernetes cluster and resources based on the roles of individual users within an enterprise. Streams requires RBAC to be enabled for secrets management and third-party dependencies:

* Hazelcast (cluster discovery service)
* Nginx (fine tuning of ingress controller permissions)

It is recommended to set people or application permissions to manage resources:

* Allow Helm to manage resources
* Allow worker nodes autoscaling
* Allow specific users to view pods, to deploy pods, to access Kubernetes Dashboard
* Allow Kubernetes to provide cloud resources, like storage or load balancer

This is a minimal configuration and you can define more specific permissions with cluster roles ([ClusterRoles](https://kubernetes.io/docs/reference/access-authn-authz/rbac/#role-and-clusterrole)) and bindings ([ClusterRoleBindings](https://kubernetes.io/docs/reference/access-authn-authz/rbac/#role-and-clusterrole)) in the cluster.

| Description                              | Type      |
| ---------------------------------------- | --------- |
| Network CNI mode with a specific plugin (CALICO or Cloud provider) to secure pod connections with other applications or resources inside the cluster | Recommended |
| Secure Kubernetes with RBAC capabilities | Required  |

##### Volumes

Several third-party components of Streams (Kafka/Zookeeper and PostgreSQL) use Kubernetes [PersistentVolumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/) and [PersistentVolumeClaims](https://kubernetes.io/docs/concepts/storage/persistent-volumes/) to enable their persistent storage. The underlying infrastructure must support this feature so that the data is properly stored on disk. This allows Streams to maintain a consistent state and save published data in the event of a component failure.

| Description                                                                 | Type     |
| --------------------------------------------------------------------------- | -------- |
| PersistentVolumes provisioner is supported by the underlying infrastructure | Required |

##### Namespaces

A namespace allows splitting of a Kubernetes cluster into separated virtual zones. It is possible to configure multiple namespaces that will be logically isolated from each other. Pods from different namespaces can communicate with a full DNS pattern (\<service-name\>.\<namespace-name\>.svc.cluster.local). A name is unique within a namespace, but not across namespaces.

As mentioned in the Kubernetes documentation, a typical usage of namespaces is separating projects and configured objects deployed by different teams.

Axway recommends installing the Streams helm chart in a dedicated namespace. This is a good practice as:

* It makes deployment easier when installing into an existing cluster.
* Resources linked to Streams are isolated into a single logical entity.
* You don’t have to specify full DNS to call other components, therefore, preventing errors. You just simply use a service name (\<service-name\>).

After the namespace is created, the Streams helm chart can be installed within this namespace by simply adding option --namespace at the installation stage.

There are two things to keep in mind though:

* Not all objects are linked to a namespace (e.g., PersistentVolumes).
* NGINX Ingress Controller can process Ingress resources from any namespace. Several annotations like [ingressClass](https://kubernetes.github.io/ingress-nginx/user-guide/multiple-ingress/) can be set in the helm chart to keep it under control.

| Description                               | Type        |
| ----------------------------------------- | ----------- |
| Install Streams in a dedicated namespace  | Recommended |

##### Pod resource limits

As explained in [Kubernetes documentation](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/), when you specify a pod, you can optionally specify how much of each resource a container needs. The most common resources to specify are CPU and memory (RAM).
Streams is provided with recommended resource requests and limits. This can be viewed and configured in the values.yaml and values-ha.yaml files under resources section for each component.
In addition, each Java service defines heap memory management with the help of Java options (Xmx and Xms). This can be found in the values files under different names depending on service type: heapOpts, jvmMemoryOpts, javaOpts. This is important that Java memory heap is kept smaller than the memory resource limit as the java service also needs to allocate objects in “off heap” memory.

| Description                                                           | Type     |
| --------------------------------------------------------------------- | -------- |
| Limit memory and CPU usage to protect the cluster                     | Required |
| Adjust Java opts (Xmx & Xms) to allocate enough resources to services | Required |

{{< alert title="Note" color="primary" >}} Axway provides the recommended values. Be aware that removing pod and JVM resource limits will result in a non-functional platform. {{< /alert >}}

##### Components health check

Kubernetes provides a very useful feature called probes. There is one probe to check if a pod is ready to be used at startup and another to periodically check if a container is still operational. These probes are respectively called “readiness probe” and “liveness probe.”
Streams uses liveness and readiness probes. Liveness probes allow to know when to restart a (unhealthy) container, while readiness probes allow to know when a container is ready to start accepting traffic.
As described in helm chart values files, both kind of probes are configured the same way on Streams microservices, that is:

```
<microservice-pod>:8080/actuator/health
```

| Description                                                         | Type     |
| ------------------------------------------------------------------- | -------- |
| Implement Kubernetes probes to manage container status in real time | Required |

##### Nodes labels

The [Kubernetes scheduler](https://kubernetes.io/docs/reference/kubernetes-api/labels-annotations-taints/#topologykubernetesiozone
) automatically takes care of the pod placement (e.g., spread your pods across nodes/availability zones, not place the pod on a node with insufficient free resources, etc.). Ensure that your nodes are configured with proper labels. If your cluster is deployed in a cloud provider (e.g. AWS, GCP, etc.), these labels are added automatically. Otherwise, you must add the following labels to each of your nodes depending on your K8s cluster version:

###### For K8s v1.17 or higher

Examples for AWS (update the values according to your cluster):

* `topology.kubernetes.io/region=us-east-1`
* `topology.kubernetes.io/zone=us-east-1c`

###### For K8s lower than v1.17

Examples for AWS (update the values according to your cluster):

* `failure-domain.beta.kubernetes.io/region=us-east-1`
* `failure-domain.beta.kubernetes.io/zone=us-east-1c`

Moreover, if you want to force the Streams pods to run only on specific nodes, you can use nodeSelector:

* In the first place, add labels of your choice to the selected nodes (e.g. label "application: streams"):

```
kubectl label nodes <node-name> application=streams
```

* Then update the values.yaml file (using the previous example):

For the Streams pods:

```
nodeSelector:
  application: streams
```

For 3rd parties pods (Nginx, Kafka, Hazelcast, Zookeeper and PostgreSQL) you have to define it for each of them:

```
nginx-ingress:
  controller:
    nodeSelector:
       application: streams
[...]
kafka:
  nodeSelector:
    application: streams
zookeeper:
  nodeSelector:
    application: streams
[...]
hazelcast:
  nodeSelector:
    application: streams
[...]
postgresql:
  master:
    nodeSelector:
      application: streams
  slave:
    nodeSelector:
    application: streams
[...]
```

| Description                           | Type     |
| ------------------------------------- | -------- |
| Dispatch Streams pods across available nodes (monitoring node can be excluded from this rule) | Recommended |

##### Affinity and anti-affinity mode

You can optionally use the Kubernetes podAntiAffinity feature to instruct Kubernetes to avoid the scheduling of the same replicas on the same node. Axway does not provide a default affinity configuration but this can be defined in the helm chart values file thanks to the `field affinity: {}`. You can also refer to the examples provided in Kubernetes documentation for more details.

| Description                                       | Type     |
| ------------------------------------------------- | -------- |
| Dispatch Streams thanks to podAntiAffinity option | Optional |

##### Autoscaling

To properly increase or decrease the number of runtime components to accommodate a workload, there are two scaling techniques used in the reference architecture:

* Nodes/VMs autoscaling
* Kubernetes pod autoscaling

###### Node scaling

If the allocated number of nodes/VMs is not enough for increasing traffic, there are different ways to scale them. We recommend using a platform-provided mechanism to control this. AWS offers the [Auto Scaling Groups](https://docs.aws.amazon.com/autoscaling/ec2/userguide/AutoScalingGroup.html) feature. There are many ways to design autoscaling. We recommend the [Cluster Autoscaler](https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler) tool which add a new node when the Kubernetes scheduler cannot schedule a new pod on the any existing nodes.

###### Horizontal Pod Autoscaler

Using Kubernetes [Horizontal Pod Autoscaler](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/) (HPA) you can automatically scale the number of components. HPA uses a control loop that checks selected utilization metrics every 15s (default value). There are several options for triggering autoscaling. The average CPU utilization can be used. It is set to a high enough value for optimal resource usages. When CPU utilization exceeds this threshold, Kubernetes adds more pods. You need to test what should be a good CPU utilization based on your pod startup time, traffic pattern and potential impact on the overall performance. An average CPU utilization of 75 percent is a good starting point. Keep in mind that to get HPA working, you need to define resource limits (note, that the default CPU limit is 2cpu). This is an example of this setting in Helm:

```
metrics:
- type: Resource
  resource:
    name: cpu
    target:
      type: Utilization
      averageUtilization: 75
```

We do not provide any specific guidelines for using Horizontal Pod Autoscaler with Streams yet.

| Description                                       | Type     |
| ------------------------------------------------- | -------- |
| The number of replicas is set manually in the values file and must be tuned depending on the expected load | Recommended |

##### External traffic

We use the NGINX Ingress Controller to expose both management and subscription APIs. NGINX Ingress Controller automatically creates a Load Balancer in the cloud provider infrastructure so that the APIs can be reached from the outside using the load balancer DNS hostname. Once known, this hostname must be updated in the ingress resource thanks to the `values.yaml` file:

```yaml
ingress:
  host: "k8s.yourdomain.tld"
```

SSL/TLS is activated by default unless you have deliberately disabled it by setting:

```yaml
ingress:
  tlsenabled: false
```

The ingress controller handles SSL/TLS termination with to the correct certificate/secret (more setup details)

| Description                                                       | Type        |
| ----------------------------------------------------------------- | ----------- |
| Need specific DNS entry to route requests                         | Required    |
| Terminate TLS at ingress level                                    | Recommended |

##### Secrets

Without secrets, all passwords are set in clear in Manifest. Kubernetes define “secret” objects to encode in base64 all sensitive information. Using Kubernetes Secrets is very useful for variables in containers, Docker registry login, and technical token for shared storage.
Here is the list of secrets related to Streams installation:

| Description  | Type                                |
| ------------ | ----------------------------------- |
| default      | kubernetes.io/service-account-token |
| hazelcast    | kubernetes.io/service-account-token |
| postgres     | Opaque                              |
| Nginx secret | Opaque                              |
| Nginx token  | kubernetes.io/service-account-token |
| helm         | kubernetes.io/service-account-token |

### Streams implementation details

![Diagram of a Kubernetes cluster](/Images/architecture/arch_k8s_cluster.png)

All Streams pods are installed into Kubernetes worker nodes. The master nodes are dedicated to Kubernetes infrastructure management. The diagram above may not reflect exactly your deployment because the K8s scheduler will automatically perform the pod placement across nodes (e.g., spread your pods across nodes, not place the pod on a node with insufficient free resources, etc.).

#### SSE Subscriber

The SSE Subscriber enables Streams to push data to subscribers (e.g., client applications) through Server-Sent-Events protocol.
Server-Sent-Events is a unidirectional http-based protocol which keeps the connection open in order for the server to push data in real time to the client.

* It exposes an API for subscribing to a Streams topic.  
* It consumes data from the streaming backbone, which is managed by Apache Kafka. It also uses Hazelcast as a distributed cache.
* It exposes an http port (8080 by default) to expose the subscription endpoint for external consumption.
* It is accessed only through the NGINX Ingress Controller.

To start this pod, the following requirements must be met:

* Apache Kafka up and running
* Hazelcast up and running

Pod characteristics of the SSE Subscriber for HA deployment mode:

* Healthcheck: LivenessProbe and ReadinessProbe, available at path: `/actuator/health`
* Kubernetes object: deployment
* Exposed traffic http port by default: 8080 (can be modified during installation)
* Resource limits: 2 CPUs & 3 GB
* Xmx & Xms: 2 GB  
* Auto-scaling: no
* Replicas: 2

#### Webhook Subscriber

The Webhook Subscriber allows external clients to be notified via HTTP Post requests made by Streams to the endpoint that was provided during their subscription.

* It exposes an API endpoint to manage webhook subscriptions.
* It provides an OpenAPI description, available at path `/openapi.yaml`. The API is accessible only through the NGINX Ingress Controller.
* It uses PostgreSQL to store the subscriptions created via the subscription API.
* It uses Hazelcast as a L2 cache layer on top of the underlying persistent system, and as a distributed cache.
* It consumes data from the streaming backbone, which is managed by Apache Kafka.

To start this pod, the following requirements must be met:

* PostgreSQL up and running
* Apache Kafka up and running
* Hazelcast up and running

Pod characteristics of the subscriber webhook for HA deployment mode:  

* Healthcheck: LivenessProbe and ReadinessProbe, available at path: `/actuator/health`
* Kubernetes object: deployment  
* Exposed traffic http port by default: 8080 (can be modified during installation)
* Resource limits: 2 CPUs & 3 GB
* Xmx & Xms: 2 GB  
* Automatic scalability: No
* Replicas: 2

#### Kafka subscriber

Streams Kafka subscriber allows to route events published to a Streams topic to an external kafka cluster.

* It exposes an API endpoint to manage Kafka subscriptions.
* It provides an OpenAPI description, available at the path `/openapi.yaml`. The API is accessible only through the NGINX Ingress Controller.
* It uses PostgreSQL to store the subscriptions created via the subscription API.
* It uses Hazelcast as a L2 cache layer on top of the underlying persistent system, and as a distributed cache.
* It consumes data from the streaming backbone, which is managed by Apache Kafka.

To start this pod, the following requirements must be met:

* PostgreSQL up and running
* Apache Kafka up and running
* Hazelcast up and running

Pod characteristics of the subscriber Kafka for HA deployment mode:

* Healthcheck: LivenessProbe and ReadinessProbe, available at path: `/actuator/health`
* Kubernetes object: deployment  
* Exposed traffic http port by default: 8080 (can be modified during installation)
* Resource limits: 2 CPUs & 3 GB
* Xmx & Xms: 2 GB  
* Automatic scalability: No
* Replicas: 2

#### Hub

The Hub is the core component of our streaming backbone managed by Apache Kafka. Thus, it consumes data from Kafka and produces transformed data (e.g., incremental updates) that will be consumed by subscribers.

* It exposes an Http port (8080 by default) to expose the API endpoint for topic management.
* It provides an OpenAPI description available at the path `/openapi.yaml`. It is accessed only through the ingress controller.
* It is in charge of data processing/transformation (e.g incremental updates computation) of the data published by the different publishers.
* It requires PostgreSQL to store topics. For caching mechanism.
* It uses Hazelcast as a L2 cache to the underlying persistent layer.

To start this pod, the following requirements must be met:

* Postgres up and running
* Apache Kafka up and running
* Hazelcast up and running

Pod characteristics of the hub for HA deployment mode:

* Healthcheck: LivenessProbe and ReadinessProbe available at path: `/actuator/health`
* Kubernetes object: deployment
* Exposed traffic http port: 8080 (can be modified during installation)
* Resources limit: 2 CPUs & 3 GB
* Xmx & Xms: 2 GB
* Automatic scalability: no
* Replicas: 2

#### HTTP-Poller Publisher

The Http-Poller Publisher has the capability to poll a target URL at a given polling period for a dedicated Streams topic. The data retrieved from each polling are then published into the Streams platform.

* It publishes data to the streaming backbone, which is managed by Apache Kafka.
* It uses Hazelcast as a distributed cache.
* It uses Zookeeper as a service discovery.

To start this pod, the following requirements must be met:

* Apache Kafka up and running
* Zookeeper up and running
* Hazelcast up and running

Pod characteristics of the HTTP-Poller Publisher for HA deployment mode:  

* Healthcheck: LivenessProbe and ReadinessProbe available at path: `/actuator/health`
* Kubernetes object: deployment
* Resources limit: 2 CPUs & 3 GB
* Xms & Xmx: 2 GB
* Automatic scalability: no
* Replicas: 2

#### HTTP-Post Publisher

The HTTP-Post Publisher allows any external component capable of performing an HTTP Post request to publish payloads in a Streams topic.

* It exposes an API (8080 by default) to publish payloads into the Streams platform.
* It provides an API description via an OpenAPI spec file at path `/openapi.yaml`. The API is accessible only through the ingress controller.
* It publishes data to the streaming backbone (Kafka).
* It uses Hazelcast as a distributed cache.
* It uses Zookeeper as a service discovery.

To start this pod, the following requirements must be met:

* Zookeeper up and running
* Apache Kafka up and running
* Hazelcast up and running

Pod characteristics of the publisher http post for HA deployment mode:

* Healthcheck: LivenessProbe and ReadinessProbe available at path: `/actuator/health`
* Kubernetes object: deployment
* Exposed traffic http port: 8080 (can be modified during installation)
* Resources limit: 2 CPUs & 3 GB
* Xms & Xmx: 2 GB
* Automatic scalability: no
* Replicas: 2

#### Kafka Publisher

The Kafka Publisher acts as a consumer of an external Kafka cluster. It consumes a configured Kafka topic from the external Kafka cluster and publishes payloads in the Streams platform.

* It publishes data to the streaming backbone (internal kafka).
* It uses Hazelcast as a distributed cache.
* It uses Zookeeper as a service discovery.

To start this pod, the following requirements must be met:

* Apache Kafka up and running
* Zookeeper up and running
* Hazelcast up and running

Pod characteristics of the publisher kafka for HA deployment mode:

* Healthcheck: LivenessProbe and ReadinessProbe available at path: `/actuator/health`
* Kubernetes object: deployment  
* Resources limit: 2 CPUs & 3 GBs
* Xms & Xmx: 2 GB
* Automatic scalability: no
* Replicas: 2

#### Salesforce publisher

The Salesforce (SFDC) Publisher provides the capability to capture changes Salesforce Streaming API PushTopics or Salesforce Platform Events. PushTopics provide the ability to subscribe to change events related to Salesforce Objects (SObjects). Platform Events allow Salesforce users to define their own publish/subscribe events. Once integrated with Streams, Salesforce events can be then broadcast by any of Streams subscribers.

It publishes data to the streaming backbone.
It uses Hazelcast as a distributed cache.
It uses Zookeeper as a service discovery.

To start this pod, the following requirements must be met:

* Apache Kafka up and running
* Zookeeper up and running
* Hazelcast up and running

Pod characteristics of the publisher SFDC for HA deployment mode:

* Healthcheck: LivenessProbe and ReadinessProbe available at path: /actuator/health
* Kubernetes object: deployment  
* Resources limit: 2 CPUs & 3 GB
* Xms & Xmx: 2 GB
* Automatic scalability: no
* Replicas: 2

#### Summary table

| Component             | Exposes API | Exposed Port | Resources Limits | Xmx & Xms | Requires | Ingress traffic | Egress traffic |
| --------------------- | ----------- | ------------ | ---------------- | --------- | -------- | --------------- | -------------- |
| SSE Subscriber        | Yes         | 8080         | 2 CPUs 3 GB      | 2 GB      | Kafka, Hazelcast             | Yes | No  |
| Webhook  Subscriber   | Yes         | 8080         | 2 CPUs 3 GB      | 2 GB      | PostgreSQL, Kafka, Hazelcast | Yes | Yes |
| Kafka subscriber      | Yes         | 8080         | 2 CPUs 3 GB      | 2 GB      | PostgreSQL, Kafka, Hazelcast | Yes | Yes |
| Hub                   | Yes         | 8080         | 2 CPUs 3 GB      | 2 GB      | PostgreSQL, Kafka, Hazelcast | Yes | No  |
| Http-Poller Publisher | No          | none         | 2 CPUs 3 GB      | 2 GB      | Kafka, Zookeeper, Hazelcast  | No  | Yes |
| Http-Post  Publisher  | Yes         | 8080         | 2 CPUs 3 GB      | 2 GB      | Kafka, Zookeeper, Hazelcast  | Yes | Yes |
| Kafka Publisher       | No          | none         | 2 CPUs 3 GB      | 2 GB      | Kafka, Zookeeper, Hazelcast  | No  | Yes |
| Salesforce Publisher  | No          | none         | 2 CPUs 3 GB      | 2 GB      | Kafka, Zookeeper, Hazelcast  | No  | Yes |

### Third parties

#### Kafka

Apache Kafka is used as stream-processing layer.  

Source Docker image:

* Repository: bitnami/kafka
* Tag: 2.5.0

Pod name: `streams-kafka`.

Pod characteristics for HA deployment mode:

| Replicas           | CPU | Memory | Xmx & Xms | Persistence |
| ------------------ | --- | ------ | --------- | ----------- |
| 3 (one in each AZ) | 1   | 4 GB   | 3 GB      | 200 GB      |

#### ZooKeeper

Apache ZooKeeper is used by Kafka.

Source Docker image:

* Repository: bitnami/zookeeper
* Tag: 3.6.2

Pod name: `streams-zookeeper`

Pod characteristics for HA deployment mode:

| Replicas           | CPU | Memory | Xmx & Xms | Persistence |
| ------------------ | --- | ------ | --------- | ----------- |
| 3 (one in each AZ) | 1   | 512 MB | n/a       | 8 GB        |

#### Hazelcast

Hazelcast is used as a distributed in-memory database to share data between streams microservice instances.

Source Docker image:

* Repository: hazelcast/hazelcast
* Tag: 3.12.9

Pod name:  `streams-hazelcast`.

Pod characteristics for HA deployment mode:

| Replicas           | CPU | Memory | Xmx & Xms | Persistence |
| ------------------ | --- | ------ | --------- | ----------- |
| 3 (one in each AZ) | 1   | 1 GB   | 512 MB    | n/a         |

#### PostgreSQL

PostgreSQL is our persistence layer.

Source Docker image:

* Repository: bitnami/postgresql
* Tag: 12.4.0

Pod names:

* `streams-postgresql-master`
* `streams-postgresql-slave`

Pod characteristics for HA deployment mode:

| Name              | Replicas | CPU | Memory  | Xmx & Xms | Persistence |
| ----------------- |--------- | --- | ------- | --------- | ----------- |
| PostgreSQL master | 1        | 1   | 1024 MB | n/a       | 8 GB        |
| PostgreSQL slave  | 1        | 1   | 1024 MB | n/a       | 8 GB        |

{{< alert title="Note" color="primary" >}} PostgreSQL is deployed in master/slave mode with asynchronous commit for replication but the failover is not done automatically.{{< /alert >}}

### Logging/tracing

Logs for a pod are accessible via Kubernetes API:

```
kubectl logs -f POD_NAME -n NAMESPACE
```

All logs generated by Streams microservice (excluding third-parties) are in JSON format.
There are 2 types of logs:

* Operational logs with LOG marker
* Metric logs with METRIC marker

#### Operational logs

Each log contains attributes always present:

| JSON attribute | Value                                   |
| -------------- | --------------------------------------- |
| dateTime       | Date & time of log in ISO 8601 format   |
| marker         | LOG                                     |
| level          | TRACE \| DEBUG \| INFO \| WARN \| ERROR |
| message        | Content of the log message              |
| loggerName     | Name of the used logger                 |
| threadName     | Name of the used thread                 |
| threadId       | Id of the used thread                   |

and others depending on the context:

| JSON attribute   | Value                                    |
| ---------------- | ---------------------------------------- |
| topicId          | Id of the associated topic               |
| publisherType    | http-poller \| http-post \| kakfa        |
| publisherId      | Instance id of the associated publisher  |
| pipelineId       | Id of the published data                 |
| subscriberType   | sse \| webhook                           |
| subscriberId     | Instance id of the associated subscriber |
| subscriptionId   | Id of the associated subscription        |
| subscriptionMode | snapshot-only \| snashot-patch           |

##### Example

```json
{
   "dateTime":"2020-04-22T20:31:17,489Z",
   "marker":"LOG",
   "level":"INFO",
   "message":"Subscription created",
   "subscriberId":"16efa8a6-4bbe-4b3e-8d67-23fde3475c8a",
   "subscriberType":"sse",
   "subscriptionId":"9ebcbd46-ed39-40cc-9ac1-2587dd7efdb8",
   "subscriptionMode":"snapshot-only",
   "topicId":"354418ce-5dea-42ea-a82a-ac0bd4da631d",
   "loggerName":"com.axway.streams.subscriber.service.SubscriptionServiceImpl",
   "threadName":"reactor-http-epoll-1",
   "threadId":"145"
}
```

##### Configuring log level

An unexposed API is available for each Streams microservice to manage logging level during runtime.

To know current logging level, run this command on a microservice pod:

```sh
curl -s “http://localhost:8080/actuator/loggers/com.axway.streams”
```

To change logging level, execute on the chosen pod the following command:

```sh
curl -i -X POST -H 'Content-Type: application/json' -d '{"configuredLevel":"DEBUG"}' http://localhost:8080/actuator/loggers/com.axway.streams
```

#### Metric logs

Each metric always contains the attributes always present:

| JSON attribute | Value                                    |
| -------------- | ---------------------------------------- |
| dateTime       | Date & time of metric in ISO 8601 format |
| marker         | METRIC                                   |
| level          | INFO                                     |
| metric         | Id of the metric                         |

and specific attributes concerning each metric:

##### subscription.started

| JSON attribute | Value                     |
| -------------- | ------------------------- |
| metric         | subscription.started      |
| topicId        | Id of the concerned topic |
| subscriptionId | Id of this subscription   |

```json
{
  "dateTime": "2020-04-22T20:30:12,021Z",
  "marker": "METRIC",
  "level": "INFO",
  "metric": "subscription.started",
  "subscriptionId": "0419f74f-f351-43fe-9a1a-2430dfa95722",
  "topicId":"329f2ab6-a9bb-4840-a4fd-626e9c2c3216"
}
```

##### subscription.ended

| JSON attribute | Value                     |
| -------------- | ------------------------- |
| metric         | subscription.ended        |
| topicId        | Id of the concerned topic |
| subscriptionId | Id of this subscription   |

```json
{
  "dateTime":"2020-04-22T20:30:31,312Z",
  "marker":"METRIC",
  "level":"INFO",
  "metric":"subscription.ended",
  "subscriptionId":"0419f74f-f351-43fe-9a1a-2430dfa95722",
  "topicId":"329f2ab6-a9bb-4840-a4fd-626e9c2c3216"
}
```
