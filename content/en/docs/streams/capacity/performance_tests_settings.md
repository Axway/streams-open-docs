---
title: Performance tests
linkTitle: Performance tests
weight: "10"
date: 2020-09-20
description: Presents performance tests achieved for different scenarios in HA mode.
---

## Performance tests settings

* All performance tests are performed on a Kubernetes cluster with [minimal recommended settings](/docs/streams/architecture/#choice-of-runtime-infrastructure-components) for HA.
* Streams microservices are configured with [minimal recommended resources](/docs/streams/architecture/#summary-table) for HA.
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
| Users                           | Number of concurrently subscribed client per topic.                            |
| Topics                          | Number of topic created on Streams platform.                                   |
| Payload size                    | Size of the message/events payloads being published in the Streams topic(s).   |
| Polling period                  | Time period at which Streams polls the target URL (HTTP-Poller).               |
| 99th percentile latency (ms)    | The maximum latency, in milliseconds, for the fastest 99% of transactions.     |
| Max latency (ms)                | The maximum observed latency in milliseconds.                                  |
| Throughput (event/s)            | The maximum amount of events passing through Streams.                          |

## Performance tests results

| Users | Topics | Payload size | Polling period | 99 %ile latency (ms) | Max latency (ms) | Throughput (event/s) |
| ----- | ------ | ------------ | -------------- | -------------------- | ---------------- | -------------------- |
| 100   | 1      | 50 KB        | 500 ms         | 40                   | 299              | 181                  |
| 3000  | 1      | 50 KB        | 500 ms         | 367                  | 1577             | 5,423                |
| 100   | 100    | 50 KB        | 500 ms         | 11                   | 513              | 182                  |
| 500   | 500    | 50 KB        | 500 ms         | 240                  | 810              | 893                  |
| 100   | 1      | 50 KB        | 1 sec          | 34                   | 216              | 91                   |
| 3000  | 1      | 50 KB        | 1 sec          | 487                  | 745              | 2,729                |
| 100   | 100    | 50 KB        | 1 sec          | 36                   | 1016             | 91                   |
| 500   | 500    | 50 KB        | 1 sec          | 89                   | 1072             | 454                  |
| 100   | 1      | 10 KB        | 500 ms         | 11                   | 511              | 181                  |
| 300   | 1      | 10 KB        | 500 ms         | 258                  | 761              | 5,423                |
| 100   | 100    | 10 KB        | 500 ms         | 9                    | 510              | 180                  |
| 500   | 500    | 10 KB        | 500 ms         | 15                   | 1012             | 900                  |
| 100   | 1      | 10 KB        | 1 sec          | 10                   | 1010             | 91                   |
| 3000  | 1      | 10 KB        | 1 sec          | 267                  | 1272             | 2,729                |
| 100   | 100    | 10 KB        | 1 sec          | 36                   | 1010             | 91                   |
| 100   | 500    | 10 KB        | 1 sec          | 9                    | 1012             | 456                  |
