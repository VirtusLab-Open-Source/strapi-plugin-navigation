import { IStrapi } from "strapi-typed";
import { NavigationItemEntity } from "../../../types";

import setupStrapi from '../../../__mocks__/strapi';
import { buildNestedPaths, filterByPath, getPluginModels } from "../functions";

declare var strapi: IStrapi;

describe('Utilities functions', () => {
  beforeAll(async () => {
    setupStrapi();
  });

  describe('Path rendering functions', () => {
    it('Can build nested path structure', async () => {
      const { itemModel } = getPluginModels();
      const rootPath = '/home/side';
      const entities = await strapi
        .query<NavigationItemEntity>(itemModel.uid)
        .findMany({
          where: {
            master: 1
          }
        });
      const nested = buildNestedPaths(entities);

      expect(nested.length).toBe(2);
      expect(nested[1].path).toBe(rootPath);
    });

    it('Can filter items by path', async () => {
      const { itemModel } = getPluginModels();
      const rootPath = '/home/side';
      const entities = await strapi
        .query<NavigationItemEntity>(itemModel.uid)
        .findMany({
          where: {
            master: 1
          }
        });
      const {
        root,
        items
      } = filterByPath(entities, rootPath);

      expect(root).toBeDefined();
      expect(root?.path).toBe(rootPath);
      expect(items.length).toBe(1)
    });
  });
});
