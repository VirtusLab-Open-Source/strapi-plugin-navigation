const { camelCase } = require('lodash');
module.exports = {
  lifecycles: {
    afterFind(results) {
      results
        .forEach(entity => {
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
    },
  },
};
