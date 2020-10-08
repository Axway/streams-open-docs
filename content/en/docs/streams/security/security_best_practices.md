{
"title": "Security best practices",
"linkTitle": "Security best practices",
"weight": 90,
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

For a list of default ports that are opened by the API Gateway components, see [Default ports](/docs/apim_installation/apigtw_install/system_requirements/#default-ports).

## Password policy

In line with security best practices, you can configure a password policy for administrator users in API Gateway Manager. Password policy refers to the size and complexity of the password, as well as to all the rules to manage the password.

It is also possible to take certain actions when a configurable number of invalid authentication attempts has occurred via HTTP basic, HTTP digest, and HTML form-based authentication.  For example, you can lock a user account or ban an IP address if a certain number of invalid passwords have been submitted to API Gateway. For details, see [Authentication filters](/docs/apim_policydev/apigw_polref/authn_common/).

For more information on setting the password policy for administrator users, see the
[Configure a password policy for admin users](/docs/apim_administration/apigtw_admin/manage_user_access/#configure-a-password-policy-for-admin-users).

You can also configure password policies for [API Manager](/docs/apim_administration/apimgr_admin/api_mgmt_admin/#enforce-password-changes) and [API Portal](/docs/apim_administration/apiportal_admin/customize_page_content/#enforce-password-policies) users.

## Sensitive files and databases

In general, it is good practice to limit the number of administrators with access to the product.

Ensure the default protection mechanisms on sensitive files used by API Gateway and API Portal remain in place.  For example, the product’s files are installed with read, update, and delete privileges such that only the product can access them by default.  There should be no reason to change these privileges.

The following files are deemed sensitive from a security perspective, where `GROUP` and `INSTANCE` placeholders represent the identifiers (for example, `group-2`, `instance-1`, and so on) of the group in a multi-group and a multi-instance domain, respectively.


### File integrity

After downloading the product package from Axway Support at [https://support.axway.com](https://support.axway.com/), it is highly recommended to verify the file integrity. Use a third-party tool for your OS to compute the hash of the downloaded file and compare it with the hash that is displayed on the Details page for the product package. Both SHA-256 and MD5 hashes are provided but it is safer to use SHA-256.

It is also recommended to protect file integrity after the product has been installed using a file integrity monitoring tool. In order to be able to configure the monitoring tool, the following tables provide information about the files used by the product and which actions can modify those files.


