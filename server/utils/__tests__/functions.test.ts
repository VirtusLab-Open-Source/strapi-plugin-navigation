import { IStrapi } from "strapi-typed";
import { NavigationItemEntity } from "../../../types";

import setupStrapi from "../../../__mocks__/strapi";
import {
  buildNestedPaths,
  filterByPath,
  getPluginModels,
  purgeSensitiveData,
  purgeSensitiveDataFromUser,
  sanitizePopulateField,
} from "../functions";

declare var strapi: IStrapi;

describe("Utilities functions", () => {
  beforeAll(async () => {
    setupStrapi();
  });

  describe("Path rendering functions", () => {
    it("Can build nested path structure", async () => {
      const { itemModel } = getPluginModels();
      const rootPath = "/home/side";
      const entities = await strapi
        .query<NavigationItemEntity>(itemModel.uid)
        .findMany({
          where: {
            master: 1,
          },
        });
      const nested = buildNestedPaths(entities);

      expect(nested.length).toBe(2);
      expect(nested[1].path).toBe(rootPath);
    });

    it("Can filter items by path", async () => {
      const { itemModel } = getPluginModels();
      const rootPath = "/home/side";
      const entities = await strapi
        .query<NavigationItemEntity>(itemModel.uid)
        .findMany({
          where: {
            master: 1,
          },
        });
      const { root, items } = filterByPath(entities, rootPath);

      expect(root).toBeDefined();
      expect(root?.path).toBe(rootPath);
      expect(items.length).toBe(1);
    });

    it("Filter out sensitive information from related entities", () => {
      const sensitiveDataModel = {
        username: "Amy",
        password: "test-password",
        accessToken: "token",
        reset_token: "token",
        renewtoken: "token",
        secret: "secret",
      };
      const result = purgeSensitiveDataFromUser(sensitiveDataModel);

      expect(result).toMatchInlineSnapshot(`
        Object {
          "username": "Amy",
        }
      `);
    });

    describe("purgeSensitiveData()", () => {
      it("should clear user sensitive data from returned entity", () => {
        const user = {
          firstname: "Amy",
          lastname: "Bishop",
          username: "Amy",
          password: "test-password",
          accessToken: "token",
          reset_token: "token",
          renewtoken: "token",
          secret: "secret",
        };
        const timestamp = "Thu Dec 21 2023 13:36:46 GMT+0100";
        const source = {
          createdBy: user,
          updatedBy: user,
          createdAt: timestamp,
          updatedAt: timestamp,
          content: "Lorem ipsum dolor sit amet",
          mainImage: {
            createdBy: user,
            updatedBy: user,
            createdAt: timestamp,
            updatedAt: timestamp,
            url: "https://lorempixel.com/60x60",
          },
        };

        expect(purgeSensitiveData(source)).toMatchInlineSnapshot(`
          Object {
            "content": "Lorem ipsum dolor sit amet",
            "createdAt": "Thu Dec 21 2023 13:36:46 GMT+0100",
            "createdBy": Object {
              "firstname": "Amy",
              "lastname": "Bishop",
              "username": "Amy",
            },
            "mainImage": Object {
              "createdAt": "Thu Dec 21 2023 13:36:46 GMT+0100",
              "createdBy": Object {
                "firstname": "Amy",
                "lastname": "Bishop",
                "username": "Amy",
              },
              "updatedAt": "Thu Dec 21 2023 13:36:46 GMT+0100",
              "updatedBy": Object {
                "firstname": "Amy",
                "lastname": "Bishop",
                "username": "Amy",
              },
              "url": "https://lorempixel.com/60x60",
            },
            "updatedAt": "Thu Dec 21 2023 13:36:46 GMT+0100",
            "updatedBy": Object {
              "firstname": "Amy",
              "lastname": "Bishop",
              "username": "Amy",
            },
          }
        `);
      });
    });

    describe("sanitizePopulateField()", () => {
      it.each(["*", true, null, undefined])(
        'should filter out "%s"',
        (populate: any) => {
          expect(sanitizePopulateField(populate)).toBe(undefined);
        }
      );

      it("should support mapping an array", () => {
        const populate = ["*", true, null, undefined, "bar"] as any;

        expect(sanitizePopulateField(populate)).toMatchInlineSnapshot(`
          Array [
            undefined,
            undefined,
            undefined,
            undefined,
            "bar",
          ]
        `);
      });

      it("should support an object", () => {
        const populate: any = Object.fromEntries(
          ["*", true, null, undefined, "bar"].map((value, index) => [
            `key-${index + 1}`,
            value,
          ])
        );

        expect(sanitizePopulateField(populate)).toMatchInlineSnapshot(`
          Object {
            "key-1": undefined,
            "key-2": undefined,
            "key-3": undefined,
            "key-4": undefined,
            "key-5": "bar",
          }
        `);
      });
    });
  });
});
