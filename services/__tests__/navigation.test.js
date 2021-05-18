
const { setupStrapi } = require("../../__mocks__/helpers/strapi");

beforeAll(setupStrapi);

describe('Navigation service', () => {
  it('Strapi is defined', () => {
      expect(strapi).toBeDefined();
      expect(strapi.contentTypes).toBeDefined();
      expect(Object.keys(strapi.contentTypes).length).toBe(4);
    });
  it('Config Content Types', async () => {
      const { configContentTypes } = require("../navigation");
      const result = [{
          uid: "application::pages.pages",
          collectionName: "pages",
          isSingle: false,
          contentTypeName: "Pages",
          endpoint: "pages",
          label: "Pages",
          labelSingular: "Page",
          name: "page",
          visible: true,
      }, {
          uid: "application::blog-post.blog-post",
          collectionName: "blog_posts",
          isSingle: false,
          contentTypeName: "BlogPost",
          endpoint: "blog-posts",
          label: "Blog posts",
          labelSingular: "Blog post",
          name: "blog-post",
          visible: true,
      }, {
          uid: "plugins::another-plugin.pages",
          collectionName: "pages",
          isSingle: false,
          contentTypeName: "Plugin-pages",
          endpoint: "plugin-pages",
          label: "Pages",
          labelSingular: "Page",
          name: "plugin-page",
          visible: true,
          plugin: "another-plugin"
    }, {
          uid: "plugins::another-plugin.blog-post",
          collectionName: "blog_posts",
          isSingle: false,
          contentTypeName: "BlogPost",
          endpoint: "plugin-blog-posts",
          label: "Blog posts",
          labelSingular: "Blog post",
          name: "plugin-blog-post",
          visible: true,
          plugin: "another-plugin"
  }];
      const types = await configContentTypes();
      console.log(types);
      expect(types[0]).toMatchObject(result[0]);
      expect(types[1]).toMatchObject(result[1]);
      expect(types[2]).toMatchObject(result[2]);
      expect(types[3]).toMatchObject(result[3]);
    });
});
