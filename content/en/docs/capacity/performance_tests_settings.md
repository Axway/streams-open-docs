---
title: Performance tests
linkTitle: Performance tests
weight: "10"
date: 2020-09-20
description: Presents performance tests achieved for different scenarios in HA mode.
---

## Performance tests settings

* All performance tests are performed on a Kubernetes cluster with [minimal recommended settings](/docs/architecture/#choice-of-runtime-infrastructure-components) for HA.
* Streams microservices are configured with [minimal recommended resources](/docs/architecture/#summary-table) for HA.
* Each run is configured for `5` minutes including a `30` seconds linear ramp with a percentage of renewed data on each API call set to `20`%.
* We ran a variety of performance tests on the architecture. These tests are executed with [Gatling](https://gatling.io) which has been customized to support SSE connections.  

Performance benchmarks are executed under different scenarios changing the following conditions:

* Number of subscribed users
* Number of topics
* Size of published payload
* Publication period

Those scenarios were run against the following publisher and subscriber:

* Http-Poller Publisher - over a Streams Managed Mock API (validated to have a low latency under load)
* SSE Subscriber - fronted by NGINX as the ingress controller.

## Performance tests terminology

This section defines common terms used in the performance test results:

| Metric                          | Definition                                                                     |
|---------------------------------|--------------------------------------------------------------------------------|
| Users                           | Number of concurrently subscribed client.                            |
| Topics                          | Number of topic created on Streams platform.                                   |
| Payload size                    | Size of the message/events payloads being published in the Streams topic(s).   |
| Polling period                  | Time period at which Streams polls the target URL (HTTP-Poller).               |
| 99th percentile latency (ms)    | The maximum latency, in milliseconds, for the fastest 99% of transactions.     |
| Max latency (ms)                | The maximum observed latency in milliseconds.                                  |
| Throughput (event/s)            | The maximum amount of events passing through Streams.                          |

## Performance tests results

| Users | Topics | Payload size | Polling period | 99 %ile latency (ms) | Max latency (ms) | Throughput (event/s) |
|-------|--------|--------------|----------------|----------------------|------------------|----------------------|
| 3000  | 100    | 50 KB        | 500 ms         | 21                   | 250              | 5455.5               |
| 250   | 250    | 50 KB        | 500 ms         | 5                    | 34               | 455.3                |
| 100   | 100    | 50 KB        | 500 ms         | 5                    | 23               | 182.1                |
| 100   | 1      | 50 KB        | 500 ms         | 13                   | 46               | 182.4                |
| 3000  | 100    | 10 KB        | 500 ms         | 6                    | 84               | 5455.4               |
| 250   | 250    | 10 KB        | 500 ms         | 3                    | 23               | 455.3                |
| 100   | 100    | 10 KB        | 500 ms         | 3                    | 19               | 182.1                |
| 100   | 1      | 10 KB        | 500 ms         | 5                    | 45               | 182.4                |
| 3000  | 100    | 50 KB        | 1 sec          | 26                   | 86               | 2736.6               |
| 250   | 250    | 50 KB        | 1 sec          | 5                    | 19               | 228.0                |
| 100   | 100    | 50 KB        | 1 sec          | 6                    | 24               | 91.2                 |
| 100   | 1      | 50 KB        | 1 sec          | 23                   | 222              | 91.5                 |
| 3000  | 100    | 10 KB        | 1 sec          | 6                    | 72               | 2736.8               |
| 250   | 250    | 10 KB        | 1 sec          | 4                    | 25               | 228.0                |
| 100   | 100    | 10 KB        | 1 sec          | 4                    | 19               | 91.2                 |
| 100   | 1      | 10 KB        | 1 sec          | 8                    | 21               | 91.5                 |

    