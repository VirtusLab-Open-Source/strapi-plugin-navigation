import { StrapiContext } from "strapi-typed";
import { ToBeFixed } from "../../../types";
import { getI18nStatus } from "../utils";

describe("i18n", () => {
  describe("Utils", () => {
    describe("getI18nStatus()", () => {
      it("should check if i18n plugin is installed", async () => {
        // Given
        const store: ToBeFixed = () => ({
          get() {
            return {};
          },
        });
        const strapi: Partial<StrapiContext["strapi"]> = {
          store,
          plugin() {
            return null as ToBeFixed;
          },
        };

        // When
        const result = await getI18nStatus({
          strapi: strapi as StrapiContext["strapi"],
        });

        // Given
        expect(result).toMatchInlineSnapshot(`
          Object {
            "defaultLocale": undefined,
            "enabled": false,
            "hasI18NPlugin": false,
            "locales": undefined,
          }
        `);
      });

      it("should check if i18n is enabled in navigation plugin config", async () => {
        // Given
        const enabled = Math.floor(Math.random() * 10) % 2 ? true : false;
        const store: ToBeFixed = () => ({
          get() {
            return { i18nEnabled: enabled };
          },
        });
        const strapi: Partial<StrapiContext["strapi"]> = {
          store,
          plugin() {
            return {
              service() {
                return {
                  async getDefaultLocale() {
                    return "en";
                  },
                  async find() {
                    return [{ code: "en" }];
                  },
                };
              },
            } as ToBeFixed;
          },
        };

        // When
        const result = await getI18nStatus({
          strapi: strapi as StrapiContext["strapi"],
        });

        // Given
        expect(result).toHaveProperty("enabled", enabled);
      });

      it("should read default locale", async () => {
        // Given
        const enabled = Math.floor(Math.random() * 10) % 2 ? true : false;
        const store: ToBeFixed = () => ({
          get() {
            return { i18nEnabled: enabled };
          },
        });
        const locale = "fr";
        const strapi: Partial<StrapiContext["strapi"]> = {
          store,
          plugin() {
            return {
              service() {
                return {
                  async getDefaultLocale() {
                    return locale;
                  },
                  async find() {
                    return [{ code: locale }];
                  },
                };
              },
            } as ToBeFixed;
          },
        };

        // When
        const result = await getI18nStatus({
          strapi: strapi as StrapiContext["strapi"],
        });

        // Given
        expect(result).toHaveProperty("defaultLocale", locale);
      });

      it("should read current locale", async () => {
        // Given
        const enabled = Math.floor(Math.random() * 10) % 2 ? true : false;
        const store: ToBeFixed = () => ({
          get() {
            return { i18nEnabled: enabled };
          },
        });
        const locale = "fr";
        const strapi: Partial<StrapiContext["strapi"]> = {
          store,
          plugin() {
            return {
              service() {
                return {
                  async getDefaultLocale() {
                    return locale;
                  },
                  async find() {
                    return [{ code: locale }];
                  },
                };
              },
            } as ToBeFixed;
          },
        };

        // When
        const result = await getI18nStatus({
          strapi: strapi as StrapiContext["strapi"],
        });

        // Given
        expect(result).toHaveProperty("locales", [locale]);
      });
    });
  });
});
