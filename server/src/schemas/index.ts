import {
  configSchema as configSchemaBase,
  navigationItemAdditionalField as navigationItemAdditionalFieldBase,
  navigationItemCustomField as navigationItemCustomFieldBase,
} from './config';

import {
  createNavigationSchema as createNavigationSchemaBase,
  updateNavigationSchema as updateNavigationSchemaBase,
} from './navigation';

export type {
  ConfigSchema,
  NavigationItemAdditionalField,
  NavigationItemCustomField,
  NavigationItemCustomFieldBase,
  NavigationItemCustomFieldMedia,
  NavigationItemCustomFieldPrimitive,
  NavigationItemCustomFieldSelect,
  NavigationPluginConfigDBSchema,
  PluginConfigKeys,
} from './config';
export * from './content-type';
export type * from './navigation';
export {
  audienceDBSchema,
  navigationDBSchema,
  navigationItemDBSchema,
  navigationItemsDBSchema,
  navigationItemType,
  readNavigationItemFromLocaleSchema,
  updateNavigationItemSchema,
  updateNavigationItemsSchema,
} from './navigation';

const applySchemaRefineHigher =
  <Schema>(baseGetter: () => Schema, updater: (schema: Schema) => void) =>
  (modifier: (base: Schema) => Schema): void => {
    updater(modifier(baseGetter()));
  };

let configSchema = configSchemaBase;
export const updateConfigSchema = applySchemaRefineHigher(
  () => configSchema,
  (next) => {
    configSchema = next;
  }
);

let navigationItemAdditionalField = navigationItemAdditionalFieldBase;
export const updateNavigationItemAdditionalField = applySchemaRefineHigher(
  () => navigationItemAdditionalField,
  (next) => {
    navigationItemAdditionalField = next;
  }
);

let navigationItemCustomField = navigationItemCustomFieldBase;
export const updateNavigationItemCustomField = applySchemaRefineHigher(
  () => navigationItemCustomField,
  (next) => {
    navigationItemCustomField = next;
  }
);

let createNavigationSchema = createNavigationSchemaBase;
export const updateCreateNavigationSchema = applySchemaRefineHigher(
  () => createNavigationSchema,
  (next) => {
    createNavigationSchema = next;
  }
);

let updateNavigationSchema = updateNavigationSchemaBase;
export const updateUpdateNavigationSchema = applySchemaRefineHigher(
  () => updateNavigationSchema,
  (next) => {
    updateNavigationSchema = next;
  }
);

export const DynamicSchemas = {
  get configSchema() {
    return configSchema;
  },
  get navigationItemAdditionalField() {
    return navigationItemAdditionalField;
  },
  get navigationItemCustomField() {
    return navigationItemCustomField;
  },
  get createNavigationSchema() {
    return createNavigationSchema;
  },
  get updateNavigationSchema() {
    return updateNavigationSchema;
  },
};
