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
                ...require('./page.settings.json'),
                apiName: 'pages',
            },
            'blog-post': {
                ...require('./blog-post.settings.json'),
                apiName: 'blog-posts',
            },
          },
          plugins: {
              navigation: {
                  services: {
                      navigation: jest.fn().mockImplementation(),
                  },
                  models: {
                      'page': require('./page.settings.json'),
                      'blog-post': require('./blog-post.settings.json'),
                  }
              }
          },
      },
      writable: true,
    })
}
module.exports = { setupStrapi };