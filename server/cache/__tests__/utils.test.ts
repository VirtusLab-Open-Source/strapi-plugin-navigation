import { IStrapi } from "strapi-typed";
import { getCacheStatus } from "../utils";

describe("Cache", () => {
  describe("Utils", () => {
    describe("getCacheStatus()", () => {
      it("should mark cache as disabled if plugin is not installed", async () => {
        // Given
        const cachePlugin = null;
        const pluginStore = { get: jest.fn() };
        const strapi = {
          plugin() {
            return cachePlugin;
          },
          store() {
            return pluginStore;
          },
        } as unknown as IStrapi;

        // When
        const result = await getCacheStatus({ strapi });

        // Then
        expect(result).toMatchInlineSnapshot(`
          Object {
            "enabled": false,
            "hasCachePlugin": false,
          }
        `);
      });

      it("should mark cache as enabled if it is enabled in config", async () => {
        // Given
        const cachePlugin = {};
        const pluginStore = { get: jest.fn() };
        const strapi = {
          plugin() {
            return cachePlugin;
          },
          store() {
            return pluginStore;
          },
        } as unknown as IStrapi;

        pluginStore.get.mockReturnValue({ isCacheEnabled: true });

        // When
        const result = await getCacheStatus({ strapi });

        // Then
        expect(result).toMatchInlineSnapshot(`
          Object {
            "enabled": true,
            "hasCachePlugin": true,
          }
        `);
      });

      it("should mark cache as enabled if it is enabled in config", async () => {
        // Given
        const cachePlugin = {};
        const pluginStore = { get: jest.fn() };
        const strapi = {
          plugin() {
            return cachePlugin;
          },
          store() {
            return pluginStore;
          },
        } as unknown as IStrapi;

        pluginStore.get.mockReturnValue({ isCacheEnabled: false });

        // When
        const result = await getCacheStatus({ strapi });

        // Then
        expect(result).toMatchInlineSnapshot(`
          Object {
            "enabled": false,
            "hasCachePlugin": true,
          }
        `);
      });
    });
  });
});
