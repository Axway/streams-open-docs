/**
 * Docs page collections require the following minimal dataset:
 *   name: [string] used in routes, ie.: /admin/collections/:slug/edit
 *   label: [string] used in CMS UI left nav
 *   label_singular: [string] used in CMS UI, ie.: 'New Post'
 *   description: [string] used in CMS UI
 */
const docsDefaults = (contentDirectory, imageDirectory) => ({
  folder: `content/en/docs/${contentDirectory}`,
  media_folder: `{{media_folder}}/${imageDirectory}`,
  public_folder: `{{public_folder}}/${imageDirectory}`,
  preview_path: `docs/${contentDirectory}/{{filename}}/`,
  create: true, // Allow users to create new documents in this collection
  delete: false, // Allow users to delete documents in this collection
  format: 'json-frontmatter', // Specify frontmatter for YAML or json-frontmatter for JSON
  fields: [
    { name: 'title', label: 'Title', widget: 'string' },
    { name: 'linkTitle', widget: 'hidden', required: false },
    { name: 'no_list', widget: 'hidden', required: false },
    { name: 'simple_list', widget: 'hidden', required: false },
    { name: 'draft', widget: 'hidden', required: false },
    { name: 'weight', widget: 'hidden', required: false },
    { name: 'date', widget: 'hidden', required: false },
    { name: 'description', label: 'Summary', widget: 'text', required: false },
    { name: 'body', label: 'Body', widget: 'markdown' },
  ],
})

/**
 * Post collections require the same minimal dataset as docs pages.
 */
const postDefaults = {
  create: true,
  delete: false,
  fields: [
    { label: 'Title', name: 'title', widget: 'string' },
    { label: 'Author', name: 'author', widget: 'string' },
    { label: 'Publish Date', name: 'date', widget: 'datetime' },
    { label: 'Summary', name: 'description', widget: 'text' },
    { label: 'Image', name: 'image', widget: 'image', required: false },
    { label: 'Body', name: 'body', widget: 'markdown' },
  ],
}

/**
 * Add new collections here.
 */
const collections = [{
  ...docsDefaults('', ''), // content directory, image directory
  name: 'docs',
  label: 'Documentation',
  description: 'Top level pages in documentation.',
  format: 'frontmatter',
  create: false,
}, {
  ...docsDefaults('streams', 'streams'),
  name: 'streams',
  label: 'Streams documentation',
  label_singular: 'page in Streams section',
  description: 'All pages relating to Streams.',
  format: 'frontmatter',
}, {  
  ...docsDefaults('streams/topics-api', 'streams'),
  name: 'topics-api',
  label: 'Streams Topics API documentation',
  label_singular: 'page in Streams Topics API section',
  description: 'All pages relating to Streams Topics API.',
  format: 'frontmatter',
}, {  // 'PATH_TO_DOC_CONTENT', 'PATH_TO_DOC_IMAGES'
  ...docsDefaults('streams/publishers', 'streams'),
  name: 'publishers',
  label: 'Streams Publishers documentation',
  label_singular: 'page in Streams Publishers section',
  description: 'All pages relating to Streams Publishers.',
  format: 'frontmatter',
}, {
  ...docsDefaults('streams/subscribers', 'streams'),
  name: 'subscribers',
  label: 'Streams Subscribers documentation',
  label_singular: 'page in Streams Subscribers section',
  description: 'All pages relating to Streams Subscribers.',
  format: 'frontmatter',
}, {
  ...docsDefaults('streams/install', 'streams'),
  name: 'install',
  label: 'Install Streams',
  label_singular: 'page in Streams install section',
  description: 'All pages relating to installing Streams.',
}, {
  ...docsDefaults('streams/capacity', 'capacity'),
  name: 'capacity',
  label: 'Capacity planning and performance',
  label_singular: 'page in Streams Capacity Planning section',
  description: 'All pages relating to capacity planning and performance tests.',
  format: 'frontmatter',
}, {
  ...docsDefaults('streams/security', 'security'),
  name: 'security',
  label: 'Security guidance',
  label_singular: 'page in Streams security section',
  description: 'All pages relating to security guidance for Streams.',
}, {
  ...docsDefaults('streams/architecture', 'architecture'),
  name: 'architecture',
  label: 'Streams Reference Architecture documentation',
  label_singular: 'page in Streams Reference Architecture section',
  description: 'All pages relating to Reference Architecture.',
  format: 'frontmatter',
}];

const cms_branch = window.location.hostname.includes('develop') ? 'develop' : 'master'; // Additional config for a develop branch and develop site

const config = {
  backend: {
    name: 'github',
    branch: cms_branch,
    repo: 'Axway/streams-open-docs', // Path to your GitHub repository.
    open_authoring: true,
  },
  publish_mode: 'editorial_workflow',
  media_folder: '/static/Images', // Media files will be stored in the repo under static/Images
  public_folder: '/Images', // The src attribute for uploaded media will begin with /Images
  site_url: 'https://streams-open-docs.netlify.com/', // URL to netlify site
  collections,
};

// Make the config object available on the global scope for processing by
// subsequent scripts.Don't rename this to `CMS_CONFIG` - it will cause the
// config to be loaded without proper processing.
window.CMS_CONFIGURATION = config;

CMS.init({ config })
