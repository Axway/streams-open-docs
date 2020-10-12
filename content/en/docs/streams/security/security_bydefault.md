{
"title": "Secure by default configuration",
"linkTitle": "Secure by default configuration",
"weight": 30,
"date": "2020-10-11",
"description": "Summary of the secure-by-default settings for Streams"
}

Security best practices recommend that products are shipped secure-by-default to ensure that an out-of-the-box installation is not vulnerable to attacks.

The following measures have been taken to ensure that Streams is secure-by-default:

* TLS communication between Streams and MariaDB is enabled by default 
* TLS communication for inbound connections is enabled by default 
* Mariadb encrypted data-at-rest is enabled by default 
* Streams microservices are authenticated to connect to hazelcast and MariaDB

{{< alert title="Caution" color="warning" >}}Turning off secure-by-default configuration effectively makes API Gateway less secure.{{< /alert >}}
