function setupStrapi() {
    Object.defineProperty(global, 'strapi', {
        value: {
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
          contentTypes: {
            'page': {
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
                  },
                  models: {
                      'pages': require('./pages.settings.json'),
                      'blog-post': require('./blog-post.settings.json'),
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
