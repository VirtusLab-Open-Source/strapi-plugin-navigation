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
            'blog-post': {
                ...require('./blog-post.settings.json'),
                apiName: 'blog-posts',
                modelName: 'blog-posts',
                associations: [{ model: 'navigationitem' }],
            },
            'my-homepage': {
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
            'plugin-page': {
                ...require('./another-plugin/pages.settings.json'),
                modelName: 'plugin-pages',
                associations: [{ model: 'navigationitem' }],
            },
            'plugin-blog-post': {
                ...require('./another-plugin/blog-post.settings.json'),
                modelName: 'plugin-blog-posts',
                associations: [{ model: 'navigationitem' }],
            }
          },
          plugins: {
              navigation: {
                  services: {
                      navigation: jest.fn().mockImplementation(),
                  }
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
