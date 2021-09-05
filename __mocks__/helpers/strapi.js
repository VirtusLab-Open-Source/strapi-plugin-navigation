const {get} = require('lodash');
function setupStrapi() {
    Object.defineProperty(global, 'strapi', {
        value: {
          query: jest.fn().mockImplementation(() => ({
              count: jest.fn().mockImplementation(),
          })),
          config: {
              custom: {
                  plugins: {
                      navigation: {
                          contentTypesNameFields: {
                              'blog_posts': ['altTitle'],
                          },
                      },
                  },
              },
            get(path, defaultValue) {
              return get(strapi, path, defaultValue);
            },
          },
          api: {
              'home-page': {
                  config: {
                      routes: [
                        {
                          method: 'GET',
                          path: '/custom-api',
                          handler: 'home-page.find',
                        },
                        {
                          method: 'PUT',
                          path: '/custom-api',
                          handler: 'home-page.update',
                        },
                      ]
                  }
              }
          },
          contentTypes: {
            'pages': {
                ...require('./pages.settings.json'),
                apiName: 'pages',
                modelName: 'pages',
                associations: [{ model: 'navigationitem' }],
            },
            'application::blog-post.blog-post': {
                ...require('./blog-post.settings.json'),
                apiName: 'blog-posts',
                modelName: 'blog-posts',
                associations: [{ model: 'navigationitem' }],
            },
            'application::my-homepages.my-homepage': {
                ...require('./my-homepage.settings.json'),
                apiName: 'my-homepage',
                modelName: 'my-homepage',
                associations: [{ model: 'navigationitem' }],
            },
            'application::page-homes.home-page': {
                ...require('./home-page.settings.json'),
                apiName: 'custom-api',
                modelName: 'home-page',
                associations: [{ model: 'navigationitem' }],
            },
            'plugins::another-plugin.pages': {
                ...require('./another-plugin/pages.settings.json'),
                modelName: 'plugin-pages',
                associations: [{ model: 'navigationitem' }],
            },
            'plugins::another-plugin.blog-post': {
                ...require('./another-plugin/blog-post.settings.json'),
                modelName: 'plugin-blog-posts',
                associations: [{ model: 'navigationitem' }],
            }
          },
          plugins: {
              navigation: {
                  services: {
                      navigation: jest.fn().mockImplementation(),
                  },
                relatedContentTypes: [
                  'application::pages.pages',
                  'application::blog-post.blog-post',
                  'application::my-homepages.my-homepage',
                  'application::page-homes.home-page',
                  'plugins::another-plugin.pages',
                  'plugins::another-plugin.blog-post'
                ]
              },
              anotherPlugin: {
                  models: {
                      'plugin-pages': require('./another-plugin/pages.settings.json'),
                      'plugin-blog-post': require('./another-plugin/blog-post.settings.json'),
                  }
              }
          },
      },
      writable: true,
    })
}
module.exports = { setupStrapi };
