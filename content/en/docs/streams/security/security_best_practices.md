{
"title": "Security best practices",
"linkTitle": "Security best practices",
"weight": 40,
"date": "2020-10-08",
"description": "Recommended best practices for securing Streams"
}

## Self-signed certificates

Using self-signed certificates may be a security risk for many reasons, including:

* Anyone can generate his own certificate and you need a very secure process to receive/send these certificates to make sure they are coming from the right partner. When using CA-signed certificates, you can rely on the CA.
* If self-signed certificates are not securely stored, anyone can change them. CA-signed certificates also must be securely stored, but no one can change them.
* There is no way to revoke self-signed certificates.

## Internet access limitation

As much as possible, limit the number of Internet access points. Do not open useless Internet connections and limit interconnections with external networks as much as possible. This limits the product’s attack surface, reduces the risk of external attacks, and makes it easier to audit the product.

## File integrity

After downloading the product package from Axway Support at [https://support.axway.com](https://support.axway.com/), it is highly recommended to verify the file integrity. Use a third-party tool for your OS to compute the hash of the downloaded file and compare it with the hash that is displayed on the Details page for the product package. Both SHA-256 and MD5 hashes are provided but it is safer to use SHA-256.

It is also recommended to protect file integrity after the product has been installed using a file integrity monitoring tool. In order to be able to configure the monitoring tool, the following tables provide information about the files used by the product and which actions can modify those files.
