---
title: Kafka Publisher
linkTitle: Kafka Publisher
weight: 3
date: 2020-04-02T00:00:00.000Z
description: Learn how to configure a topic associated to a Kafka Publisher.
---
{{< alert title="Beta feature" color="warning" >}}Kafka publisher is still experimental, and will be enhanced in future releases.{{< /alert >}}

Streams can act as a consumer of your dedicated Apache Kafka cluster. It consumes records from one configured topic, then publishes those records into Streams platform to broadcast data to any of Streams [subscribers](../../subscribers).

## Kafka publisher configuration

Configuring an Apache Kafka publisher requires some specific configuration recommended by the official Kafka consumer API.

| Configuration Entry | Mandatory | Possible value            | Default value | Description                                                                                                                                                                                                                                                                                                                                                  |
| ------------------- | --------- | ------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| bootstrapServers    | Yes       | List with comma separator | N/A           | A list of brokers host, or port pair, to establish connection to your Kafka cluster.                                                                                                                                                                                                                                                                         |
| topic               | Yes       | A string value            | N/A           | Name of the Kafka topic where to fetch records from.                                                                                                                                                                                                                                                                                                         |
| keyValue            | No        | A string value            |               | Enable filtering on records key value (simple equality is performed).                                                                                                                                                                                                                                                                                        |
| keyDeserializer     | No        | string                    | string        | Deserializer used for record key. Currently only *string* is supported.                                                                                                                                                                                                                                                                                    |
| valueDeserializers  | No        | json or smile             | json          | Deserializer used for record value. Supported deserializers are `json` and `smile`. This means your Kafka topic must contains JSON strings or data encoded into data format "binary JSON". See [FasterXML](https://github.com/FasterXML/smile-format-specification) to learn more about this specification.                                                 |
| readFrom            | No        | earliest, latest, or none | latest        | What to do when there is no initial offset in Kafka or if the current offset does not exist any more on the server. **Earliest**: automatically reset the offset to the earliest offset. **Latest**: automatically reset the offset to the latest offset. **None**: throw exception to the consumer if no previous offset is found for the consumer's group. |
| consumerProperties  | No        | Map                       |               | A map of consumer properties as mentioned in the [Kafka consumer API official documentation](https://kafka.apache.org/documentation/#consumerconfigs). Changing this property can alter the way the publisher behaves. You must contact the support team before changing this property.                                                                      |

Here is an example of a configuration of a kafka publisher:

```json
{
    "name": "myStreamsTopic",
    "publisher": {
        "type": "kafka",
        "config": {
            "bootstrapServers": "streams-kafka:9092",
            "topic": "kafka-topic",
            "keyValue": "A",
            "consumerProperties": {
                "max.partition.fetch.bytes": 2048
            }

        }
    }
}
```

## Default Kafka consumer properties

Our Kafka publisher acts as a consumer of your Kafka topics, and it defines two Kafka consumer properties by default:

* `ENABLE_AUTO_COMMIT` defaults to *false*. Records received by the Kafka publisher are not committed before being delivered in the Streams platform.
* `GROUP_ID` is set to the ID of the streams topic. It allows to have one consumer in the consumer group to make sure that the original order is kept.

We do not recommend you to override these values in the `consumerProperties` configuration of the publisher, as it can lead to unexpected behaviors.

## Limitations

A Kafka publisher configuration cannot be updated once the streams topic is created. Patching the configuration of a Kafka publisher throws the following error:

```json
{
    "errors": [
        {
            "status": 400,
            "title": "Validation error: Publisher config",
            "detail": "Configuration update on Kafka publisher is not yet supported",
            "meta": {},
            "source": {
                "parameter": "config"
            }
        }
    ]
}
```

If you would like to change your Kafka publisher configuration, we suggest you to delete the previously created streams topic and create a new streams topic configured with the right configuration for your Kafka publisher.
