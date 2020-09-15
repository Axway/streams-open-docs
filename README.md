# Axway-Open-Docs

Streams-Open-Docs is a docs-as-code implementation for Axway Streams documentation. It is built using the [Hugo](https://gohugo.io/) static site generator with the [Google Docsy](https://github.com/google/docsy) theme. The site is deployed on Netlify at <https://streams-open-docs.netlify.app/>. Users can edit any documentation page using GitHub web UI or a WYSIWYG editor provided by [Netlify CMS](https://www.netlifycms.org/).

This repository contains all files for building and deploying the site. The Markdown files for the documentation are stored at `/content/en/docs`.

# Set up and work locally
* Follow install guide: https://axway-open-docs.netlify.app/docs/contribution_guidelines/setup_work_locally/
* Make sure to clone repo WITHOUT `--recurse-submodules --depth 1` options
* Run ./build.sh script
