---
title: Performance tests
linkTitle: Performance tests
weight: "10"
date: 2020-09-20
description: Presents performance tests achieved for different scenarios in high availability (HA) mode.
---

## Performance tests settings

* All performance tests are performed on a Kubernetes cluster with [minimal recommended settings](/docs/architecture/#choice-of-runtime-infrastructure-components) for HA.
* Streams microservices are configured with [minimal recommended resources](/docs/architecture/#summary-table) for HA.

Performance benchmarks are executed under different scenarios changing the following conditions:

* Number of subscribed users
* Number of topics
* Size of published payload
* Publication period

Folling are the results for two different use cases of Streams:

* SSE subscriber paired with HTTP Poller publisher
* Webhook subscriber paired with HTTP Post publisher

## Performance tests terminology

The folling table defines common terms used in the performance test results:

| Metric                          | Definition                                                                     |
|---------------------------------|--------------------------------------------------------------------------------|
| Users                           | Number of concurrently subscribed client.                            |
| Topics                          | Number of topic created on Streams platform.                                   |
| Payload size                    | Size of the message/events payloads being published in the Streams topic(s).   |
| Publication period              | Time period at which Streams polls the target URL (HTTP-Poller) or receives new data (HTTP-Post). |
| 99th percentile latency (ms)    | The maximum latency, in milliseconds, for the fastest 99% of transactions.     |
| Max latency (ms)                | The maximum observed latency in milliseconds.                                  |
| Throughput (event/s)            | The maximum amount of events passing through Streams.                          |

## Performance tests results

### SSE and HTTP-Poller performance tests

Streams uses the following publisher and subscriber:

* Http-Poller Publisher - over a Streams Managed Mock API (validated to have a low latency under load with a percentage of renewed data on each API call set to `20%`).
* SSE Subscriber - front-end by NGINX as the ingress controller and queried by [Gatling](https://gatling.io) which has been customized to support SSE connections.

Each run is configured for `5` minutes including a `30` seconds linear ramp.

| Users | Topics | Payload size | Publication period | 99 %ile latency (ms) | Max latency (ms) | Throughput (event/s) |
|-------|--------|--------------|----------------|----------------------|------------------|----------------------|
| 3000  | 100    | 50 KB        | 500 ms         | 21                   | 250              | 5455.5               |
| 250   | 250    | 50 KB        | 500 ms         | 5                    | 34               | 455.3                |
| 100   | 100    | 50 KB        | 500 ms         | 5                    | 23               | 182.1                |
| 100   | 1      | 50 KB        | 500 ms         | 13                   | 46               | 182.4                |
| 3000  | 100    | 20 KB        | 500 ms         | 6                    | 84               | 5455.4               |
| 250   | 250    | 20 KB        | 500 ms         | 3                    | 23               | 455.3                |
| 100   | 100    | 20 KB        | 500 ms         | 3                    | 19               | 182.1                |
| 100   | 1      | 20 KB        | 500 ms         | 5                    | 45               | 182.4                |

| Users | Topics | Payload size | Publication period | 99 %ile latency (ms) | Max latency (ms) | Throughput (event/s) |
|-------|--------|--------------|----------------|----------------------|------------------|----------------------|
| 3000  | 100    | 50 KB        | 1 sec          | 26                   | 86               | 2736.6               |
| 250   | 250    | 50 KB        | 1 sec          | 5                    | 19               | 228.0                |
| 100   | 100    | 50 KB        | 1 sec          | 6                    | 24               | 91.2                 |
| 100   | 1      | 50 KB        | 1 sec          | 23                   | 222              | 91.5                 |
| 3000  | 100    | 20 KB        | 1 sec          | 6                    | 72               | 2736.8               |
| 250   | 250    | 20 KB        | 1 sec          | 4                    | 25               | 228.0                |
| 100   | 100    | 20 KB        | 1 sec          | 4                    | 19               | 91.2                 |
| 100   | 1      | 20 KB        | 1 sec          | 8                    | 21               | 91.5                 |

### Webhook and HTTP-Post performance tests

Streams uses the following publisher and subscriber:

* Http-Post Publisher - front-end by NGINX as the ingress controller.
* Webhook Subscriber - posting data to an internal webhook tooling.

Each run is configured for around `5` minutes, the exact value may vary slightly because of the tooling used to post publication data.

| Users | Topics | Payload size | Publication period | 99 %ile latency (ms) | Max latency (ms) | Throughput (event/s) |
|-------|--------|--------------|--------------------|----------------------|------------------|----------------------|
| 50    | 1      | 20 KB        | 1 sec              | 76                   | 135              | 47,62                |
| 200   | 1      | 20 KB        | 1 sec              | 220                  | 289              | 183,49               |
| 750   | 1      | 20 KB        | 1 sec              | 835                  | 972              | 657,89               |
| 50    | 50     | 20 KB        | 1 sec              | 40                   | 67               | 47,39                |
| 200   | 200    | 20 KB        | 1 sec              | 41                   | 130              | 185,19               |
| 50    | 1      | 50 KB        | 1 sec              | 72                   | 85               | 47,39                |
| 200   | 1      | 50 KB        | 1 sec              | 214                  | 263              | 181,82               |
| 750   | 1      | 50 KB        | 1 sec              | 810                  | 958              | 657,89               |
| 50    | 50     | 50 KB        | 1 sec              | 45                   | 85               | 46,95                |
| 200   | 200    | 50 KB        | 1 sec              | 111                  | 340              | 174,67               |

| Users | Topics | Payload size | Publication period | 99 %ile latency (ms) | Max latency (ms) | Throughput (event/s) |
|-------|--------|--------------|--------------------|----------------------|------------------|----------------------|
| 50    | 1      | 20 KB        | 2 sec              | 79                   | 102              | 24,39                |
| 200   | 1      | 20 KB        | 2 sec              | 214                  | 259              | 96,62                |
| 750   | 1      | 20 KB        | 2 sec              | 797                  | 963              | 336,32               |
| 50    | 50     | 20 KB        | 2 sec              | 81                   | 373              | 24,39                |
| 200   | 200    | 20 KB        | 2 sec              | 50                   | 171              | 89,69                |
| 500   | 500    | 20 KB        | 2 sec              | 87                   | 345              | 205,76               |
| 50    | 1      | 50 KB        | 2 sec              | 79                   | 103              | 24,39                |
| 200   | 1      | 50 KB        | 2 sec              | 229                  | 263              | 90,50                |
| 750   | 1      | 50 KB        | 2 sec              | 858                  | 1007             | 297,62               |
| 50    | 50     | 50 KB        | 2 sec              | 46                   | 84               | 24,15                |
| 200   | 200    | 50 KB        | 2 sec              | 56                   | 265              | 90,09                |
| 500   | 500    | 50 KB        | 2 sec              | 270                  | 721              | 184,50               |
