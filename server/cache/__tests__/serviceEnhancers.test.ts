import { IStrapi } from "strapi-typed";
import { addCacheConfigFields } from "../serviceEnhancers";

describe("Cache", () => {
  describe("Enhancers", () => {
    describe("addCacheConfigFields()", () => {
      it("should return config fields", async () => {
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
        const previousConfig = {
          foo: "bar",
        };

        pluginStore.get.mockReturnValue({ isCacheEnabled: true });

        // When
        const result = await addCacheConfigFields({ strapi, previousConfig });

        // Then
        expect(result).toMatchInlineSnapshot(`
          Object {
            "foo": "bar",
            "isCacheEnabled": true,
            "isCachePluginEnabled": true,
          }
        `);
      });
    });
  });
});
