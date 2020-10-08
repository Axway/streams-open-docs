{
"title": "Security architecture",
"linkTitle": "Security architecture",
"weight": 30,
"date": "2020-10-08",
"description": "Architecture of Streams from a security perspective."
}

## Streams architecture

The following diagram shows the product architecture from a security perspective.  The legend explains the security level on connections (SSL by default, always SSL, can be SSL, and so on) and on data storage (signed or encrypted).

![API Gateway architecture and connections](/Images/security/apigw_sec_arch_a5.png)

The diagram includes the following components:

* ES Conf: Entity Store Configuration, which is a file-based store for all policy data.
* Domain Creds: Salted hash of administrator user credentials.
* LDAP/IDM: Identity Management products, such as authentication or authorization servers.
* Domain: An administrative entity comprising at least one Admin Node Manager and at least one API Gateway.  These logical components can be located on the same physical or virtual host or separated across multiple physical or virtual hosts as required.

