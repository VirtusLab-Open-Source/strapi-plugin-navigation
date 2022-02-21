const { setupStrapi } = require('../../../__mocks__/strapi');

describe('Navigation services', () => {
  beforeAll(async () => {
    setupStrapi();
  });

  describe('Correct config', () => {
    it('Declares Strapi instance', () => {
      expect(strapi).toBeDefined()
      expect(strapi.plugin('navigation').service('navigation')).toBeDefined()
    });

    it('Defines proper content types', () => {
      expect(strapi.contentTypes).toBeDefined()
      expect(strapi.plugin('navigation').contentTypes).toBeDefined()
    });

    it('Can read and return plugins config', () => {
      expect(strapi.plugin('navigation').config('contentTypes')).toBeDefined()
      expect(strapi.plugin('navigation').config('allowedLevels')).toBeDefined()
      expect(strapi.plugin('navigation').config()).not.toBeDefined()
    });
  });

  describe('Render navigation', () => {
    it('Can render branch in flat format', async () => {
      const service = strapi.plugin('navigation').service('navigation');
      const result = await service.render({ idOrSlug: 1 });

      expect(result).toBeDefined()
      expect(result.length).toBe(2)
    });

    it('Can render branch in tree format', async () => {
      const service = strapi.plugin('navigation').service('navigation');
      const result = await service.render({
        idOrSlug: 1,
        type: "TREE"
      });

      expect(result).toBeDefined()
      expect(result.length).toBeGreaterThan(0)
    });

    it('Can render branch in rfr format', async () => {
      const service = strapi.plugin('navigation').service('navigation');
      const result = await service.render({
        idOrSlug: 1,
        type: "RFR"
      });

      expect(result).toBeDefined()
      expect(result.length).toBeGreaterThan(0)
    });

    it('Can render only menu attached elements', async () => {
      const service = strapi.plugin('navigation').service('navigation');
      const result = await service.render({
        idOrSlug: 1,
        type: "FLAT",
        menuOnly: true.valueOf,
      });

      expect(result).toBeDefined()
      expect(result.length).toBe(1)
    });

    it('Can render branch by path', async () => {
      const service = strapi.plugin('navigation').service('navigation');
      const result = await service.render({
        idOrSlug: 1,
        type: "FLAT",
        rootPath: '/home/side'
      });

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
    });
  });

  describe('Render child', () => {
    it('Can render child', async () => {
      const service = strapi.plugin('navigation').service('navigation');
      const result = await service.renderChildren(1, "home");

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
    });
  });
});
