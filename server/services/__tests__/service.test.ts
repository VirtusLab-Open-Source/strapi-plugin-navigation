import { IStrapi } from "strapi-typed";
import { IClientService } from "../../../types";

import setupStrapi from '../../../__mocks__/strapi';
import { getPluginService, RENDER_TYPES } from "../../utils";

declare var strapi: IStrapi

describe('Navigation services', () => {
  beforeAll(async () => {
    setupStrapi();
  });

  describe('Correct config', () => {
    it('Declares Strapi instance', () => {
      expect(strapi).toBeDefined()
      expect(strapi.plugin('navigation').service('admin')).toBeDefined()
      expect(strapi.plugin('navigation').service('client')).toBeDefined()
      expect(strapi.plugin('navigation').service('common')).toBeDefined()
    });

    it('Defines proper content types', () => {
      expect(strapi.contentTypes).toBeDefined()
      expect(strapi.plugin('navigation').contentTypes).toBeDefined()
    });

    it('Can read and return plugins config', () => {
      expect(strapi.plugin('navigation').config('additionalFields')).toBeDefined()
      expect(strapi.plugin('navigation').config('contentTypes')).toBeDefined()
      expect(strapi.plugin('navigation').config('contentTypesNameFields')).toBeDefined()
      expect(strapi.plugin('navigation').config('contentTypesPopulate')).toBeDefined()
      expect(strapi.plugin('navigation').config('allowedLevels')).toBeDefined()
      expect(strapi.plugin('navigation').config('gql')).toBeDefined()
    });
  });

  describe('Render navigation', () => {
    it('Can render branch in flat format', async () => {
      const clientService = getPluginService<IClientService>('client');
      const result = await clientService.render({ idOrSlug: 1 });

      expect(result).toBeDefined()
      expect(result.length).toBe(2)
    });

    it('Can render branch in tree format', async () => {
      const clientService = getPluginService<IClientService>('client');
      const result = await clientService.render({
        idOrSlug: 1,
        type: RENDER_TYPES.TREE
      });

      expect(result).toBeDefined()
      expect(result.length).toBeGreaterThan(0)
    });

    it('Can render branch in rfr format', async () => {
      const clientService = getPluginService<IClientService>('client');
      const result = await clientService.render({
        idOrSlug: 1,
        type: RENDER_TYPES.RFR
      });

      expect(result).toBeDefined()
      expect(result.pages).toBeDefined()
      expect(result.nav).toBeDefined()
    });

    it('Can render only menu attached elements', async () => {
      const clientService = getPluginService<IClientService>('client');
      const result = await clientService.render({
        idOrSlug: 1,
        type: RENDER_TYPES.FLAT,
        menuOnly: true,
      });

      expect(result).toBeDefined()
      expect(result.length).toBe(1)
    });

    it('Can render branch by path', async () => {
      const clientService = getPluginService<IClientService>('client');
      const result = await clientService.render({
        idOrSlug: 1,
        type: RENDER_TYPES.FLAT,
        menuOnly: false,
        rootPath: '/home/side'
      });

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
    });
  });

  describe('Render child', () => {
    it('Can render child', async () => {
      const clientService = getPluginService<IClientService>('client');
      const result = await clientService.renderChildren({idOrSlug: 1, childUIKey: "home"});

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
    });
  });
});
