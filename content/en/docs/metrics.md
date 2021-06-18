---
title: Streams metrics
linkTitle: Metrics
weight: 8
date: 2019-04-02
description: Understand the metrics provided by Streams
---

## Introduction

Streams provides metrics in a Prometheus format when the
[monitoring parameters](/docs/install/helm-parameters/#monitoring-parameters) are enabled.
These are meant to be scraped by a Prometheus server and visualized through Grafana on our custom dashboards.

## Metrics types

Although we assume you are familiar with the Prometheus metrics format, here is a quick explanation of the main
metrics types produced by [micrometer](https://micrometer.io/docs/registry/prometheus) and how to make use of them:

* Gauge: A gauge is the simplest metric to use. Like the fuel gauge of a car, it is a value that goes up and down
and has immediate meaning.

* Counter: The more common metric type in Prometheus, a counter is a number that _always goes up_ (that restriction makes
it more reliable). It is usually differentiated into a rate to get an indication of how fast that number is going up.

* Timer: A timer records task durations by keeping a counter of completed tasks, and a counter of their cumulated time.
Utilize those metrics through ratios and rates.

## Metrics

### Custom metrics

The following custom metrics have been implemented. They include labels describing the service name, type,
and unique identifier, as well as some custom labels when suitable.

| Type    | Metric                                  | Description                                               | Example usage |
| -----   | --------------------------              | ---------------------------                               | ------        |
| Gauge   | streams_global_topics                   | Total number of Streams topics                       |  |
| Gauge   | streams_global_persistent_subscriptions | Total number of persistent subscriptions    | streams_global_persistent_subscriptions{subscription_status="active"} |
| Gauge   | streams_topics                          | Number of active topics on a Streams publisher            | streams_topics{streams_service="publisher-http-poller"} |
| Gauge   | streams_active_subscriptions            | Number of active subscriptions on a Streams subscriber    | streams_topics{streams_service="subscriber-sse"} |
| Counter | streams_input_events_total              | Number of messages received by a Streams service          | rate(streams_input_events_total{streams_name="streams-subscriber-sse"}[2m]) |
| Counter | streams_output_events_total             | Number of messages emitted by a Streams service           | rate(streams_input_events_total{data_type="patch"}[2m]) |

The keyword "global" refers to the scope of the metrics. Global metrics are reported by all instances of the same type of service and will have the same value regardless of the service instance that reports them;
whereas, the others only give information about the service instance which reported them.

### Default Spring Boot metrics

Our frameworks provides additional metrics; however,
we recommend you pay attention to the following timers:

* http\_client\_request\_seconds : timer of the web requests _emitted_ by Streams (i.e., polling or webhook).

* http\_server\_requests\_seconds : timer of the web requests _received_ and handled by Streams (i.e., REST API, self-health check, and http-post).

These are split into a sum of cumulated seconds spent waiting for the requests,
a counter of the number of requests, and a gauge of the maximum request time over the latest period of time.
For example, to get the average incoming requests' processing time, you could plot:

```sh
rate(http_server_requests_seconds_sum[2m])/rate(http_server_requests_seconds_count[2m])
```

## Monitoring

Regardless of basic system metrics, such as CPU usage or memory usage, Streams expose custom metrics that need to be monitored to prevent issues with your Streams installation:

* Number of active subscriptions:
    * It must be under 1500 for each subscriber pods.
    * It is set by `streams_active_subscriptions`.
* Rate of input events for Streams hub:
    * It must be under 500 events by seconds.
    * It is set by `rate(streams_input_events_total{streams_service="hub", data_type="snapshot"}[2m])`.
* JVM memory used:
    * It must be lower than the total pod memory for each pod, otherwise they will be `OOM kill` after a short period of time.
    * It is respectively set by `jvm_memory_used_bytes` and `container_memory_working_set_bytes`.
