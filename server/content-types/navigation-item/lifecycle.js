'use strict';
const { camelCase } = require('lodash');

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/models.html#life-cycle-callbacks)
 * to customize this model
 */

module.exports = {
  type: {
    INTERNAL: 'INTERNAL',
    EXTERNAL: 'EXTERNAL',
    WRAPPER: 'WRAPPER',
  },
  additionalFields: {
    AUDIENCE: 'audience',
  },
  lifecycles: {
    afterFind(results) {
      results.forEach(_ => {
        _?.related.forEach(entity => {
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
