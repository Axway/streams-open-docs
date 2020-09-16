# Axway-Open-Docs

Axway-Open-Docs is a docs-as-code implementation for Axway documentation. It is built using the [Hugo](https://gohugo.io/) static site generator with the [Google Docsy](https://github.com/google/docsy) theme. The site is deployed on Netlify at <https://axway-open-docs.netlify.app/>. Users can edit any documentation page using GitHub web UI or a WYSIWYG editor provided by [Netlify CMS](https://www.netlifycms.org/).

This repository contains all files for building and deploying the Axway Streams **microsite** in the Axway-Open-Docs ecosystem. The Markdown files for the documentation are stored at `/content/en/docs`.

## Contribute

We welcome your contributions! To get started, go to <https://streams-open-docs.netlify.app/docs/>. Browse the documentation and use the options in the right navigation to edit any page using GitHub or Netlify CMS.

Before you start contributing, please read the [contribution guidelines](https://axway-open-docs.netlify.app/docs/contribution_guidelines/).

## Build locally

If you are a maintainer of this documentation site, or a contributor who will be making frequent or major contributions to the documentation, we recommend you set up and build the site locally on your computer. This enables you to easily test changes locally before pushing to GitHub.

### Before you start

You must have the following installed in your development environment:

* Git client
* Hugo
* Node.js

See [Set up and work locally](https://axway-open-docs.netlify.app/docs/contribution_guidelines/setup_work_locally/) for information on recommended versions of these tools and for tips on installing them in a WSL environment.

### Clone the repository to your local environment

Clone the repository:

```
cd ~
git clone git@github.com:Axway/streams-open-docs.git
```

After running these commands, you will have a local copy of the repository in the following location:

```
/home/YOUR-UNIX-USERNAME/streams-open-docs
```

### Build the site locally

Run the `build.sh` command in your site root:

```
cd ~/streams-open-docs/
./build.sh
```

The `build.sh` script performs the following:

* Adds the `docsy` theme Git submodule
* Adds the `axway-open-docs-common` Git submodule
* Installs the npm packages required by Docsy
* Runs the `hugo server` command

The website is now available locally at `http://localhost:1313/`.

You can now add or edit Markdown files in the `content\en\docs\` directory and Hugo will automatically rebuild the site with your changes.