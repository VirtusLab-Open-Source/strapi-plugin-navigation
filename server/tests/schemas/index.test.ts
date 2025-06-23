import {
  ConfigSchema,
  CreateNavigationSchema,
  DynamicSchemas,
  NavigationDBSchema,
  NavigationItemAdditionalField,
  NavigationItemCustomField,
  updateConfigSchema,
  updateCreateNavigationSchema,
  updateNavigationItemAdditionalField,
  updateNavigationItemCustomField,
  updateUpdateNavigationSchema,
} from '../../src/schemas';

describe('Navigation', () => {
  describe('Server', () => {
    describe('Schemas', () => {
      // Given
      const cases = [
        {
          key: 'configSchema',
          updater: updateConfigSchema,
          schema: () => DynamicSchemas.configSchema,

          validData: {
            additionalFields: [],
            allowedLevels: 3,
            cascadeMenuAttached: false,
            contentTypes: [],
            contentTypesNameFields: {},
            contentTypesPopulate: {},
            gql: {
              navigationItemRelated: [],
            },
            pathDefaultFields: [],
            preferCustomContentTypes: false,
            isCacheEnabled: false,
          } satisfies ConfigSchema,
        },
        {
          key: 'createNavigationSchema',
          updater: updateCreateNavigationSchema,
          schema: () => DynamicSchemas.createNavigationSchema,
          validData: {
            documentId: '',
            id: undefined,
            name: '',
            visible: true,
          } satisfies CreateNavigationSchema,
        },
        {
          key: 'updateUpdateNavigationDBSchema',
          updater: updateUpdateNavigationSchema,
          schema: () => DynamicSchemas.updateNavigationSchema,
          validData: {
            documentId: '',
            id: 1,
            locale: '',
            name: '',
            slug: '',
            visible: true,
            items: [],
          } satisfies NavigationDBSchema,
        },
        {
          key: 'navigationItemAdditionalField',
          updater: updateNavigationItemAdditionalField,
          schema: () => DynamicSchemas.navigationItemAdditionalField,
          validData: {
            label: '',
            name: '',
            type: 'boolean',
          } satisfies NavigationItemAdditionalField,
        },
        {
          key: 'navigationItemCustomField',
          updater: updateNavigationItemCustomField,
          schema: () => DynamicSchemas.navigationItemCustomField,
          validData: {
            label: '',
            name: '',
            type: 'boolean',
          } satisfies NavigationItemCustomField,
        },
      ];

      it.each(cases)('it should update schema for %s', ({ updater, schema, validData }: any) => {
        // Given
        updater((schema: any) => {
          return schema.refine((data: unknown) => false);
        });

        // Then
        expect(() => schema().parse(validData)).toThrow();
      });
    });
  });
});
