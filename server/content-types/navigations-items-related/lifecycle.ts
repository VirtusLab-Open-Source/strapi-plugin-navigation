import { camelCase } from 'lodash';
import { ToBeFixed } from '../../../types';
export default {
  lifecycles: {
    afterFind(results: ToBeFixed) {
      results
        .forEach((entity: ToBeFixed) => {
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
