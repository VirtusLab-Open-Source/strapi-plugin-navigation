
const { setupStrapi } = require("../../__mocks__/helpers/strapi");

beforeAll(setupStrapi);

describe('Navigation service', () => {
  it('Strapi is defined', () => {
      expect(strapi).toBeDefined();
      expect(strapi.contentTypes).toBeDefined();
      expect(Object.keys(strapi.contentTypes).length).toBe(2);
    });
  it('Config Content Types', () => {
      const { configContentTypes } = require("../navigation");
      const result = [{
          uid: "application::page.page",
          collectionName: "pages",
          isSingle: false,
          contentTypeName: "Page",
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
      }];
      expect(configContentTypes()[0]).toMatchObject(result[0]);
      expect(configContentTypes()[1]).toMatchObject(result[1]);
    });
});
