const { setupStrapi } = require('../../__mocks__/helpers/strapi');

beforeAll(setupStrapi);

describe('Navigation service', () => {
  it('Strapi is defined', () => {
    expect(strapi).toBeDefined();
    expect(strapi.contentTypes).toBeDefined();
    expect(Object.keys(strapi.contentTypes).length).toBe(6);
  });
  it('Config Content Types', () => {
    const { configContentTypes } = require('../navigation');
    const results = [
      {
        uid: 'application::pages.pages',
        collectionName: 'pages',
        isSingle: false,
        contentTypeName: 'Pages',
        endpoint: 'pages',
        label: 'Pages',
        labelSingular: 'Page',
        name: 'page',
        visible: true,
      }, {
        uid: 'application::blog-post.blog-post',
        collectionName: 'blog_posts',
        isSingle: false,
        contentTypeName: 'BlogPost',
        endpoint: 'blog-posts',
        label: 'Blog posts',
        labelSingular: 'Blog post',
        name: 'blog-post',
        visible: true,
      }, {
        uid: 'application::my-homepages.my-homepage',
        collectionName: 'my-homepages',
        isSingle: true,
        contentTypeName: 'MyHomepage',
        endpoint: 'my-homepage',
        label: 'My Homepage',
        labelSingular: 'My Homepage',
        name: 'my-homepage',
        visible: true,
      }, {
        uid: 'application::page-homes.home-page',
        collectionName: 'page_homes',
        isSingle: true,
        contentTypeName: 'HomePage',
        endpoint: 'custom-api',
        label: 'Page Home',
        labelSingular: 'Page Home',
        name: 'home-page',
        visible: true,
      }, {
        uid: 'plugins::another-plugin.pages',
        collectionName: 'pages',
        isSingle: false,
        contentTypeName: 'Plugin-pages',
        endpoint: 'plugin-pages',
        label: 'Pages',
        labelSingular: 'Page',
        name: 'plugin-page',
        visible: true,
        plugin: 'another-plugin',
      }, {
        uid: 'plugins::another-plugin.blog-post',
        collectionName: 'blog_posts',
        isSingle: false,
        contentTypeName: 'BlogPost',
        endpoint: 'plugin-blog-posts',
        label: 'Blog posts',
        labelSingular: 'Blog post',
        name: 'plugin-blog-post',
        visible: true,
        plugin: 'another-plugin',
      }];
    return configContentTypes().then(types => {
      types.map(type => {
        const result = results.find(({ uid }) => uid === type.uid);
        expect(type).toMatchObject(result);
      });
    });
  });
});
