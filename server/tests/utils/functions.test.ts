import { faker } from '@faker-js/faker';
import { Core } from '@strapi/strapi';
import { ConfigSchema, NavigationItemAdditionalField } from '../../src/schemas';
import {
  assertConfig,
  assertNotEmpty,
  FORBIDDEN_CUSTOM_FIELD_NAMES,
  getCustomFields,
  getPluginModels,
  isContentTypeEligible,
  resolveGlobalLikeId,
  RESTRICTED_CONTENT_TYPES,
  validateAdditionalFields,
} from '../../src/utils';
import { asProxy } from '../utils';

describe('Navigation', () => {
  describe('Server', () => {
    describe('Utils', () => {
      describe('Functions', () => {
        describe('getCustomFields()', () => {
          it('should filter out audience', () => {
            // Given
            const additionalFields: Array<NavigationItemAdditionalField> = [
              'audience',
              asProxy<NavigationItemAdditionalField>({
                label: faker.string.sample(10),
              }),
              asProxy<NavigationItemAdditionalField>({
                label: faker.string.sample(10),
              }),
              asProxy<NavigationItemAdditionalField>({
                label: faker.string.sample(10),
              }),
            ];

            // When
            const result = getCustomFields(additionalFields);

            // Then
            expect(result).not.toContain('audience');
          });
        });

        describe('validateAdditionalFields()', () => {
          // Given
          const getAdditionalField = () =>
            asProxy<NavigationItemAdditionalField>({
              label: faker.string.sample(10),
              name: faker.string.sample(10),
            });

          it('should pass valid fields', () => {
            // Given
            const additionalFields: Array<NavigationItemAdditionalField> = [
              'audience',
              getAdditionalField(),
              getAdditionalField(),
              getAdditionalField(),
            ];

            // Then
            expect(() => {
              validateAdditionalFields(additionalFields);
            }).not.toThrow();
          });

          it('should check for unique items', () => {
            // Given
            const additionalField = getAdditionalField();
            const additionalFields: Array<NavigationItemAdditionalField> = [
              'audience',
              additionalField,
              additionalField,
              getAdditionalField(),
            ];

            // Then
            expect(() => {
              validateAdditionalFields(additionalFields);
            }).toThrow();
          });

          it.each(FORBIDDEN_CUSTOM_FIELD_NAMES)('%s name should not be allowed', (name: string) => {
            const additionalField = asProxy<NavigationItemAdditionalField>({
              label: faker.string.sample(),
              name,
            });
            // Given
            const additionalFields: Array<NavigationItemAdditionalField> = [
              'audience',
              additionalField,
              getAdditionalField(),
              getAdditionalField(),
            ];

            // Then
            expect(() => {
              validateAdditionalFields(additionalFields);
            }).toThrow();
          });
        });

        describe('assertNotEmpty()', () => {
          it.each([null, undefined])('%s should throw', (value) => {
            // Then
            expect(() => {
              assertNotEmpty(value);
            }).toThrow();
          });

          it.each([
            faker.number.int(),
            faker.string.sample(10),
            faker.date.anytime(),
            faker.datatype.boolean(),
            {},
          ])('%s should pass', (value) => {
            // Then
            expect(() => assertNotEmpty(value)).not.toThrow();
          });

          it('should allow passing of custom error', () => {
            // Given
            const error = new (class extends Error {
              type = 'CUSTOM_ERROR';
            })();

            // Then
            expect(() => assertNotEmpty(null, error)).toThrow(error);
          });
        });

        describe('resolveGlobalLikeId', () => {
          it('should handle api ids', () => {
            // Then
            expect(resolveGlobalLikeId('api::blog-post.blog-post')).toMatchInlineSnapshot(
              `"BlogPost"`
            );
          });

          it('should handle other ids', () => {
            // Then
            expect(resolveGlobalLikeId('plugin::navigation.navigation-item')).toMatchInlineSnapshot(
              `"NavigationNavigationItem"`
            );
          });
        });

        describe('assertConfig()', () => {
          it('should typecast valid config', () => {
            // Given
            const config: ConfigSchema = {
              additionalFields: ['audience'],
              allowedLevels: faker.number.int(),
              cascadeMenuAttached: faker.datatype.boolean(),
              contentTypes: ['api::blog-post.blog-post'],
              contentTypesNameFields: {},
              contentTypesPopulate: {},
              gql: {
                navigationItemRelated: [],
              },
              pathDefaultFields: {},
              preferCustomContentTypes: faker.datatype.boolean(),
              isCacheEnabled: faker.datatype.boolean(),
            };

            // Then
            expect(() => assertConfig(config)).not.toThrow();
          });

          it.each([
            null,
            undefined,
            faker.datatype.boolean(),
            faker.date.anytime(),
            faker.number.int(),
            faker.string.sample(10),
            asProxy<ConfigSchema>({
              additionalFields: ['audience'],
              allowedLevels: faker.number.int(),
              cascadeMenuAttached: faker.datatype.boolean(),
            }),
          ])('%s should throw', (value) => {
            // Then
            expect(() => assertConfig(value)).toThrow();
          });
        });

        describe('isContentTypeEligible()', () => {
          it.each(RESTRICTED_CONTENT_TYPES)('%s should be disallowed', (contentType) => {
            // Then
            expect(isContentTypeEligible(contentType)).toBe(false);
          });

          it.each(['api::article.article', 'api::blog.blog', 'plugin::upload.file'])(
            '%s should be allowed',
            (contentType) => {
              // Then
              expect(isContentTypeEligible(contentType)).toBe(true);
            }
          );
        });

        describe('getPluginModels()', () => {
          it("should return plugin's models", () => {
            // Given
            const plugin = jest.fn();
            const contentType = jest.fn();
            const strapi = asProxy<Core.Strapi>({
              plugin,
            });

            plugin.mockReturnValue({ contentType });
            contentType.mockReturnValueOnce(faker.string.sample(10));
            contentType.mockReturnValueOnce(faker.string.sample(10));
            contentType.mockReturnValueOnce(faker.string.sample(10));
            contentType.mockReturnValueOnce(faker.string.sample(10));

            // When
            const result = getPluginModels({ strapi });

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
