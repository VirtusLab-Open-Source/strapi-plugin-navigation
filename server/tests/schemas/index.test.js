"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schemas_1 = require("../../src/schemas");
describe('Navigation', () => {
    describe('Server', () => {
        describe('Schemas', () => {
            // Given
            const cases = [
                {
                    key: 'configSchema',
                    updater: schemas_1.updateConfigSchema,
                    schema: () => schemas_1.DynamicSchemas.configSchema,
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
                    },
                },
                {
                    key: 'createNavigationSchema',
                    updater: schemas_1.updateCreateNavigationSchema,
                    schema: () => schemas_1.DynamicSchemas.createNavigationSchema,
                    validData: {
                        documentId: '',
                        id: undefined,
                        name: '',
                        visible: true,
                    },
                },
                {
                    key: 'updateUpdateNavigationDBSchema',
                    updater: schemas_1.updateUpdateNavigationSchema,
                    schema: () => schemas_1.DynamicSchemas.updateNavigationSchema,
                    validData: {
                        documentId: '',
                        id: 1,
                        locale: '',
                        name: '',
                        slug: '',
                        visible: true,
                        items: [],
                    },
                },
                {
                    key: 'navigationItemAdditionalField',
                    updater: schemas_1.updateNavigationItemAdditionalField,
                    schema: () => schemas_1.DynamicSchemas.navigationItemAdditionalField,
                    validData: {
                        label: '',
                        name: '',
                        type: 'boolean',
                    },
                },
                {
                    key: 'navigationItemCustomField',
                    updater: schemas_1.updateNavigationItemCustomField,
                    schema: () => schemas_1.DynamicSchemas.navigationItemCustomField,
                    validData: {
                        label: '',
                        name: '',
                        type: 'boolean',
                    },
                },
            ];
            it.each(cases)('it should update schema for %s', ({ updater, schema, validData }) => {
                // Given
                updater((schema) => {
                    return schema.refine((data) => false);
                });
                // Then
                expect(() => schema().parse(validData)).toThrow();
            });
        });
    });
});
