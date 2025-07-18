"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const faker_1 = require("@faker-js/faker");
const utils_1 = require("../../src/utils");
const utils_2 = require("../utils");
describe('Navigation', () => {
    describe('Server', () => {
        describe('Utils', () => {
            describe('Functions', () => {
                describe('getCustomFields()', () => {
                    it('should filter out audience', () => {
                        // Given
                        const additionalFields = [
                            'audience',
                            (0, utils_2.asProxy)({
                                label: faker_1.faker.string.sample(10),
                            }),
                            (0, utils_2.asProxy)({
                                label: faker_1.faker.string.sample(10),
                            }),
                            (0, utils_2.asProxy)({
                                label: faker_1.faker.string.sample(10),
                            }),
                        ];
                        // When
                        const result = (0, utils_1.getCustomFields)(additionalFields);
                        // Then
                        expect(result).not.toContain('audience');
                    });
                });
                describe('validateAdditionalFields()', () => {
                    // Given
                    const getAdditionalField = () => (0, utils_2.asProxy)({
                        label: faker_1.faker.string.sample(10),
                        name: faker_1.faker.string.sample(10),
                    });
                    it('should pass valid fields', () => {
                        // Given
                        const additionalFields = [
                            'audience',
                            getAdditionalField(),
                            getAdditionalField(),
                            getAdditionalField(),
                        ];
                        // Then
                        expect(() => {
                            (0, utils_1.validateAdditionalFields)(additionalFields);
                        }).not.toThrow();
                    });
                    it('should check for unique items', () => {
                        // Given
                        const additionalField = getAdditionalField();
                        const additionalFields = [
                            'audience',
                            additionalField,
                            additionalField,
                            getAdditionalField(),
                        ];
                        // Then
                        expect(() => {
                            (0, utils_1.validateAdditionalFields)(additionalFields);
                        }).toThrow();
                    });
                    it.each(utils_1.FORBIDDEN_CUSTOM_FIELD_NAMES)('%s name should not be allowed', (name) => {
                        const additionalField = (0, utils_2.asProxy)({
                            label: faker_1.faker.string.sample(),
                            name,
                        });
                        // Given
                        const additionalFields = [
                            'audience',
                            additionalField,
                            getAdditionalField(),
                            getAdditionalField(),
                        ];
                        // Then
                        expect(() => {
                            (0, utils_1.validateAdditionalFields)(additionalFields);
                        }).toThrow();
                    });
                });
                describe('assertNotEmpty()', () => {
                    it.each([null, undefined])('%s should throw', (value) => {
                        // Then
                        expect(() => {
                            (0, utils_1.assertNotEmpty)(value);
                        }).toThrow();
                    });
                    it.each([
                        faker_1.faker.number.int(),
                        faker_1.faker.string.sample(10),
                        faker_1.faker.date.anytime(),
                        faker_1.faker.datatype.boolean(),
                        {},
                    ])('%s should pass', (value) => {
                        // Then
                        expect(() => (0, utils_1.assertNotEmpty)(value)).not.toThrow();
                    });
                    it('should allow passing of custom error', () => {
                        // Given
                        const error = new (class extends Error {
                            constructor() {
                                super(...arguments);
                                this.type = 'CUSTOM_ERROR';
                            }
                        })();
                        // Then
                        expect(() => (0, utils_1.assertNotEmpty)(null, error)).toThrow(error);
                    });
                });
                describe('resolveGlobalLikeId', () => {
                    it('should handle api ids', () => {
                        // Then
                        expect((0, utils_1.resolveGlobalLikeId)('api::blog-post.blog-post')).toMatchInlineSnapshot(`"BlogPost"`);
                    });
                    it('should handle other ids', () => {
                        // Then
                        expect((0, utils_1.resolveGlobalLikeId)('plugin::navigation.navigation-item')).toMatchInlineSnapshot(`"NavigationNavigationItem"`);
                    });
                });
                describe('assertConfig()', () => {
                    it('should typecast valid config', () => {
                        // Given
                        const config = {
                            additionalFields: ['audience'],
                            allowedLevels: faker_1.faker.number.int(),
                            cascadeMenuAttached: faker_1.faker.datatype.boolean(),
                            contentTypes: ['api::blog-post.blog-post'],
                            contentTypesNameFields: {},
                            contentTypesPopulate: {},
                            gql: {
                                navigationItemRelated: [],
                            },
                            pathDefaultFields: {},
                            preferCustomContentTypes: faker_1.faker.datatype.boolean(),
                            isCacheEnabled: faker_1.faker.datatype.boolean(),
                        };
                        // Then
                        expect(() => (0, utils_1.assertConfig)(config)).not.toThrow();
                    });
                    it.each([
                        null,
                        undefined,
                        faker_1.faker.datatype.boolean(),
                        faker_1.faker.date.anytime(),
                        faker_1.faker.number.int(),
                        faker_1.faker.string.sample(10),
                        (0, utils_2.asProxy)({
                            additionalFields: ['audience'],
                            allowedLevels: faker_1.faker.number.int(),
                            cascadeMenuAttached: faker_1.faker.datatype.boolean(),
                        }),
                    ])('%s should throw', (value) => {
                        // Then
                        expect(() => (0, utils_1.assertConfig)(value)).toThrow();
                    });
                });
                describe('singularize()', () => {
                    it('should singularize plural string', () => {
                        // Then
                        expect((0, utils_1.singularize)('blogs')).toEqual('blog');
                    });
                    it('should leave singular string as is', () => {
                        // Then
                        expect((0, utils_1.singularize)('blog')).toEqual('blog');
                    });
                });
                describe('isContentTypeEligible()', () => {
                    it.each(utils_1.RESTRICTED_CONTENT_TYPES)('%s should be disallowed', (contentType) => {
                        // Then
                        expect((0, utils_1.isContentTypeEligible)(contentType)).toBe(false);
                    });
                    it.each(['api::article.article', 'api::blog.blog', 'plugin::upload.file'])('%s should be allowed', (contentType) => {
                        // Then
                        expect((0, utils_1.isContentTypeEligible)(contentType)).toBe(true);
                    });
                });
                describe('getPluginModels()', () => {
                    it("should return plugin's models", () => {
                        // Given
                        const plugin = jest.fn();
                        const contentType = jest.fn();
                        const strapi = (0, utils_2.asProxy)({
                            plugin,
                        });
                        plugin.mockReturnValue({ contentType });
                        contentType.mockReturnValueOnce(faker_1.faker.string.sample(10));
                        contentType.mockReturnValueOnce(faker_1.faker.string.sample(10));
                        contentType.mockReturnValueOnce(faker_1.faker.string.sample(10));
                        contentType.mockReturnValueOnce(faker_1.faker.string.sample(10));
                        // When
                        const result = (0, utils_1.getPluginModels)({ strapi });
                        // Then
                        expect(result).toEqual({
                            masterModel: expect.any(String),
                            itemModel: expect.any(String),
                            relatedModel: expect.any(String),
                            audienceModel: expect.any(String),
                        });
                    });
                });
            });
        });
    });
});
