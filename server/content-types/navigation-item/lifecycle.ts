'use strict';
import { camelCase } from "lodash";
import { ToBeFixed } from "../../../types";

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/models.html#life-cycle-callbacks)
 * to customize this model
 */

export default {
  type: {
    INTERNAL: 'INTERNAL',
    EXTERNAL: 'EXTERNAL',
    WRAPPER: 'WRAPPER',
  },
  additionalFields: {
    AUDIENCE: 'audience',
  },
  lifecycles: {
    afterFind(results: ToBeFixed) {
      results.forEach((_: ToBeFixed) => {
        _?.related.forEach((entity: ToBeFixed) => {
          for (const [key, value] of Object.entries(entity)) {
            const newKey = camelCase(key);
            if (value) {
              entity[newKey] = value;
            }
            if (newKey !== key) {
              delete entity[key];
            }
          }
        });
      });
    },
  },
};
