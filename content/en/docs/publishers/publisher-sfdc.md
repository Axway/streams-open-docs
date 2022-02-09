---
title: Salesforce Publisher
linkTitle: Salesforce Publisher
weight: 4
date: 2020-07-02
description: The Salesforce Publisher provides the capability to capture changes from Salesforce.com via Salesforce Streaming API PushTopics or Salesforce Platform Events. Learn how to configure a topic associated to a Salesforce Publisher.
---

{{< alert title="Beta feature" color="warning" >}}This feature is released in beta.{{< /alert >}}

PushTopics provide the ability to subscribe to changes related to Salesforce Objects (SObjects) whereas Platform Events allow Salesforce users to define their own publish/subscribe events. After integrated with Streams, Salesforce events can then be broadcast by any of Streams [subscribers](/docs/subscribers).

## Setup a new connected App in Salesforce

You must create a connected App in Salesforce to secure Streams connection to Salesforce with JWT Bearer token flow. The OAuth 2.0 JWT bearer token flow allows the client to post a JWT to the Salesforce OAuth token endpoint. Then, Salesforce processes the JWT, which includes a digital signature, and issues an access token based on prior approval of the app.

To setup your Salesforce Connected App, follow [Create a Connected App](https://help.salesforce.com/articleView?id=connected_app_create.htm) in Salesforce documentation.
  
After your connected App is created, follow the [Enable OAuth Settings for API Integration](https://help.salesforce.com/articleView?id=connected_app_create_api_integration.htm) section to integrate your App with the Salesforce API.

When enabling the OAuth settings, ensure the following:

* Configure your Oauth settings for _JWT OAuth flow_ by selecting `Use Digital Signatures`.
* You must upload the public key of your digital certificate.
* You can create a Private Key and Self-Signed Digital Certificate by following [Create a Private Key and Self-Signed Digital Certificate](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/fdx_dev_auth_key_and_cert.htm).
* Note that when using _JWT OAuth flow_ the `Callback URL` is not used. However it is mandatory in Salesforce's UI. To workaround this, you can enter any value, such as `http://localhost`.
* Select the OAuth scopes to apply to the connected app:
    * Access and manage your data (api)
    * Perform requests on your behalf at any time (refresh_token, offline_access)

## Manage access to your connected App

After a connected App is installed in your organization, you can [manage the app access](https://help.salesforce.com/articleView?id=connected_app_manage.htm) by configuring permissions and policies for the app. For example, you can define who can use the connected app and where they can access the app from.

From Salesforce UI, configure the access to your connected App:

* Manage [Oauth Access Policies](https://help.salesforce.com/articleView?id=connected_app_manage_oauth.htm):
    * Under OAuth Policies, click the **Permitted Users** dropdown menu and select **Admin approved users are pre-authorized**.
    * Set **Refresh Token Policy** to **Refresh token is valid until revoked**.
* Make sure the [IP Relaxation and Continuous IP Enforcement](https://help.salesforce.com/articleView?id=connected_app_continuous_ip.htm) settings of the Connected App settings is compatible with the settings of your Salesforce Org.
* Give users access to the connected App by configuring the [profiles or permission sets](https://help.salesforce.com/articleView?id=connected_app_manage_additional_settings.tm).

## Salesforce publisher configuration

The Salesforce publisher requires some specific configuration.

| Configuration Entry           | Mandatory |  Default value | Description |
| ----------------------------- | --------- | -------------- | ----------- |
| loginUrl                      | Yes       | None           | The login URL of your Salesforce instance, for example, <https://login.salesforce.com> |
| instanceUrl                   | Yes       | None           | The URL of your Salesforce instance. |
| privateKey                    | Yes       | None           | The private key (PKCS#1 or PKCS#8) of the Digital Certificate setup in your Salesforce Connected App. |
| clientId                      | Yes       | None           | The client ID or customer ID of your Salesforce Connected App. |
| username                      | Yes       | None           | The username, login or email of your Salesforce account. |
| channel                       | Yes       | None           | The Salesforce PushTopics or Channel ID to subscribe to. |
| retryMaxAttempts              | no        | 3              | The max number of retries in case of errors. |
| retryBackOffInitialDuration   | no        | PT1S           | Period after which the first retry is attempt (ISO-8601 format). Min = PT0S (0s); Max = PT10S (10s) |
| retryBackOffMaxDuration       | no        | PT10S          | Period max between two attempt (ISO-8601 format). Min = PT0S (0s) ; Max = PT60S (60s) |
| retryBackOffFactor            | no        | 0.5            | The factor used to determine the next retry duration |

The following is an example of a configuration of the Salesforce Publisher:

```json
{
    "name": "myStreamsTopic",
    "publisher": {
        "type": "kafka",
        "config": {
            "loginUrl": "https://login.salesforce.com",
            "instanceUrl": "https://my.instance.salesforce.com",
            "privateKey": "-----BEGIN RSA PRIVATE KEY-----MIIEpAIBAAKCAQEAqN1v25iqRp6wle5QOUbPmg5k093vbZOOlEFiIH8i5PidOsbRJ6k62jn1/cHHgo7qbi4bZ6TBEUhpSPgiF/qmouv4WxkU+9pWdoMUSlq/Kr+JUxgQk5S+T/Pb1xmav9m4a53d2WbNE9II7AVsVIHaghK+QFC9+PldqktjugqNubQ8PY239NV3aret034HVoeE6ketcM4JjXIw8gZZMNGqqNa2I1m5j8YneF9RElrQrUg9LZeBwSVYud00Oe/tNXK91JMtJBGi2Kiw77WlJrdbRZsdKzd+1Svj+L8/gGQ789DU82fCisy3bCixb++ZKOsZKcPjoXlgnfU9EIPl6oDojwIDAQABAoIBAQCob/Cyj25RcNrdQtBcwYg0t+TU/IxltYjD0xApMAfDc0WKKmTYddJReP0pOBBk519pta36TPmT3rG+alu/pXJwEoYxgCxRJ7GVFxy3KhuDbXhyHQ/z1gfdhehLr+uPMIHnPfdffe9MB0UC7FEHYBRGyqzWAe8lyvnIyem6oVPyXXVTQOhLlDFtIfF2EXK1FxcXSkZH803Xc7UVsNAv2wrS224cL3W4eQnIsWnX2WpZ1PPSBJPNTHasgTyJ/fPaKgzy+qgixiD2yejZPoCGhUwAOSTvN5WBlHgbPImjbE6t04SMegeLz+G6wRJpeu+EtHQ+Sf0FVLEdx+stKQqXy1EY5AoGBANS5OmDmo4m6q9oApLbujArk3J/jOGgny7KeNQRS+mTm/OZb93IOgyHuBXEdzTU/R7U314SHuBKff0TNcz95Lk+oORen61Vh7sktAxG5ZRmCD3YJbhPvX7v9Aa/sSXe9uicUwAIX5mVtoPq14y9mVfSVBa0vkEMSfKNB/41GyMU1AoGBAMs4B0boqn0PnMY+XmuQCT9NOvH9bEQMGKOMVUm/3kjNP+qvVU0oNxBmjSqy6cABwFjZSTAvNLFkintUCXVxgnfmuGzu8lvBOAI/7toFXZ+1z4LHOd4Vi4Jj2XGPRR/6r8yPyuqnPqxIBcpZW9gLrAOi84r8+SJAPuBU6widqgMzAoGBAIdcorhcqz4OKiLb+/RoEXcxMO8RIKiugiFUKPpqbulcTxuq8+eBMpKZqp7TTuyOKuw2745m6ov3MH4wmiCO1RhdPI9ADDFV0yPy35wctCeqKnp6/6/xx6KRGcy/d/SZJ2aM/q2WVca/HwvKSBm2bgXn+ie9N3hmwCcG7T4SB9ntAoGAPk+ks5JdzFEAMi0niHW20CkfHNom20qWN3etIxrozovYwF4Ymrrs/2Nif6gyUkR3NQcTEOo4jvgUGjKvX8p5RciB3iz6NTYutUnjNAiXJ4R451GtJbKXf1iccNyMRnz4cJHal07Gwc6nr97scXdKvCa35HMi9OScIu8GzjKB0c8CgYB6fa4XJYpJxAAwa/AoX9ZpRjwsdc9Hbt+1K39G+smKEe817Prfc26h390UgB3qm7GWdltNXEhrhrNjOSg+E8aVLEG53jXuihy51ktec1WVJD83zN0Es4LChSqYcQwox6rGsQkYyfkiJ0fVEEuCrihsWAOfzY90dHK4mh9tWYFj+Q==-----END RSA PRIVATE KEY-----",
            "clientId": "3YFG9fNRfJ62pJ5IUgIyPf2hmeFIVYiZofGzqM0LJ_gpWTGy3ak0usxpEol.mPMK9rURG1OOcX0fvBzMO4QNR",
            "username" : "my-account@mydomain.com",
            "channel": "/event/CustomEvent__e",
            "retryMaxAttempts": 3,
            "retryBackOffInitialDuration": "PT1S",
            "retryBackOffMaxDuration": "PT10S",
            "retryBackOffFactor": 0.5
        }
    }
}
```
