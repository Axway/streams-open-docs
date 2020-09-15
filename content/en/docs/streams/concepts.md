---
title: Streams concepts
linkTitle: Concepts
weight: 150
date: 2019-04-02
description: Streams is a publish/subscribe (pub/sub) messaging service where the senders of messages are decoupled from the receivers of messages.
---

## Streams general concepts

There are several key concepts in a pub/sub service:

| Concept | Description |
|---------|-------------|
| Message | The data that transits through the service. |
| Topic | An entity that represents a feed of messages. |
| [Publisher](../publishers) | Creates messages and send them in a topic. |
| [Subscriber](../subscribers) | Subscribes to a topic to receive published messages. |

![Streams Concepts](/Images/streams/streams-architecture-concepts.png)
