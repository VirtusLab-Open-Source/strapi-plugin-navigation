"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const faker_1 = require("@faker-js/faker");
const zod_1 = require("zod");
const config_1 = require("../../src/config");
describe('Navigation', () => {
    describe('Server', () => {
        describe('Config', () => {
            describe('setup()', () => {
                // Given
                const setStore = jest.fn();
                const getStore = jest.fn();
                const getFromConfig = jest.fn();
                const getContentTypes = jest.fn();
                const strapi = {
                    get contentTypes() {
                        return getContentTypes();
                    },
                    store() {
                        return {
                            get: getStore,
                            set: setStore,
                        };
                    },
                    plugin() {
                        return {
                            config: getFromConfig,
                        };
                    },
                };
                beforeEach(() => {
                    jest.resetAllMocks();
                });
                it('should read all from default plugin config when nothing is present in database', async () => {
                    // Given
                    getStore.mockReturnValue({});
                    getFromConfig.mockReturnValue({});
                    getContentTypes.mockReturnValue({});
                    // When
                    const result = await (0, config_1.configSetup)({ strapi });
                    // Then
                    expect(result).toEqual({
                        additionalFields: expect.any(Array),
                        allowedLevels: expect.any(Number),
                        cascadeMenuAttached: expect.any(Boolean),
                        contentTypes: expect.any(Array),
                        contentTypesNameFields: expect.any(Object),
                        contentTypesPopulate: expect.any(Object),
                        gql: expect.objectContaining({
                            navigationItemRelated: expect.any(Array),
                        }),
                        isCacheEnabled: expect.any(Boolean),
                        pathDefaultFields: expect.any(Object),
                        preferCustomContentTypes: false,
                    });
                });
                it('should provide schema validation', async () => {
                    // Given
                    getStore.mockReturnValue({
                        allowedLevels: faker_1.faker.string.alphanumeric(),
                    });
                    getFromConfig.mockReturnValue({});
                    getContentTypes.mockReturnValue({});
                    // Then
                    await expect(async () => {
                        await (0, config_1.configSetup)({ strapi });
                    }).rejects.toThrow(zod_1.ZodError);
                });
                it('should throw validation error if additional field name contains space', async () => {
                    // Given
                    const invalidField = [
                        {
                            name: 'invalid name',
                            label: 'Invalid Label',
                            type: 'string',
                        },
                    ];
                    getStore.mockReturnValue({
                        additionalFields: invalidField,
                    });
                    getFromConfig.mockReturnValue({});
                    getContentTypes.mockReturnValue({});
                    // Then
                    await expect(async () => {
                        await (0, config_1.configSetup)({ strapi });
                    }).rejects.toThrow(zod_1.ZodError);
                });
                it('should should use values from database over default ones', async () => {
                    // Given
                    const allowedLevels = faker_1.faker.number.int({
                        min: 99,
                        max: 200,
                    });
                    getStore.mockReturnValue({
                        allowedLevels,
                    });
                    getFromConfig.mockReturnValue({});
                    getContentTypes.mockReturnValue({});
                    // When
                    const result = await (0, config_1.configSetup)({ strapi });
                    // Then
                    expect(result).toHaveProperty('allowedLevels', allowedLevels);
                });
                // TODO: check validity of this test
                it.todo('should alert where no value is available in either of sources');
                it('should cleanup deleted content types', async () => {
                    // Given
                    const allContentTypes = [
                        faker_1.faker.string.alpha({
                            length: 10,
                        }),
                        faker_1.faker.string.alpha({
                            length: 10,
                        }),
                        faker_1.faker.string.alpha({
                            length: 10,
                        }),
                    ].map((contentType) => `api::${contentType}.${contentType}`);
                    const deletedContentType = faker_1.faker.helpers.arrayElement(allContentTypes);
                    getContentTypes.mockReturnValue(Object.fromEntries(allContentTypes
                        .filter((contentType) => contentType !== deletedContentType)
                        .map((contentType) => [contentType, {}])));
                    getStore.mockReturnValue({
                        contentTypes: allContentTypes,
                    });
                    getFromConfig.mockReturnValue({});
                    // When
                    const result = await (0, config_1.configSetup)({ strapi });
                    // Then
                    expect(result.contentTypes).not.toContain(deletedContentType);
                });
                // TODO: test `validateAdditionalFields`
                it.todo('should check if custom fields config is valid');
                it('should save configuration details in database', async () => {
                    // Given
                    const allowedLevels = faker_1.faker.number.int({
                        min: 99,
                        max: 200,
                    });
                    const cascadeMenuAttached = faker_1.faker.datatype.boolean();
                    const preferCustomContentTypes = faker_1.faker.datatype.boolean();
                    const isCacheEnabled = faker_1.faker.datatype.boolean();
                    getStore.mockReturnValue({
                        allowedLevels,
                        cascadeMenuAttached,
                        preferCustomContentTypes,
                        isCacheEnabled,
                    });
                    getFromConfig.mockReturnValue({});
                    getContentTypes.mockReturnValue({});
                    // When
                    const result = await (0, config_1.configSetup)({ strapi });
                    // Then
                    expect(setStore).toHaveBeenCalledWith({
                        key: 'config',
                        value: result,
                    });
                });
            });
        });
    });
});
