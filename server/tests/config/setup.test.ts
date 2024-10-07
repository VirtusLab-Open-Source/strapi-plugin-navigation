import { faker } from '@faker-js/faker';
import { Core } from '@strapi/strapi';
import { ZodError } from 'zod';

import { configSetup } from '../../src/config';

describe('Navigation', () => {
  describe('Server', () => {
    describe('Config', () => {
      describe('setup()', () => {
        // Given
        const setStore = jest.fn();
        const getStore = jest.fn();
        const getFromConfig = jest.fn();
        const getContentTypes = jest.fn();
        const strapi: Core.Strapi = {
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
        } as unknown as Core.Strapi;

        beforeEach(() => {
          jest.resetAllMocks();
        });

        it('should read all from default plugin config when nothing is present in database', async () => {
          // Given
          getStore.mockReturnValue({});
          getFromConfig.mockReturnValue({});
          getContentTypes.mockReturnValue({});

          // When
          const result = await configSetup({ strapi });

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
            allowedLevels: faker.string.alphanumeric(),
          });
          getFromConfig.mockReturnValue({});
          getContentTypes.mockReturnValue({});

          // Then
          expect(async () => {
            await configSetup({ strapi });
          }).rejects.toThrow(ZodError);
        });

        it('should should use values from database over default ones', async () => {
          // Given
          const allowedLevels = faker.number.int({
            min: 99,
            max: 200,
          });

          getStore.mockReturnValue({
            allowedLevels,
          });
          getFromConfig.mockReturnValue({});
          getContentTypes.mockReturnValue({});

          // When
          const result = await configSetup({ strapi });

          // Then
          expect(result).toHaveProperty('allowedLevels', allowedLevels);
        });

        // TODO: check validity of this test
        it.todo('should alert where no value is available in either of sources');

        it('should cleanup deleted content types', async () => {
          // Given
          const allContentTypes = [
            faker.string.alpha({
              length: 10,
            }),
            faker.string.alpha({
              length: 10,
            }),
            faker.string.alpha({
              length: 10,
            }),
          ].map((contentType) => `api::${contentType}.${contentType}`);
          const deletedContentType = faker.helpers.arrayElement(allContentTypes);

          getContentTypes.mockReturnValue(
            Object.fromEntries(
              allContentTypes
                .filter((contentType) => contentType !== deletedContentType)
                .map((contentType) => [contentType, {}])
            )
          );

          getStore.mockReturnValue({
            contentTypes: allContentTypes,
          });
          getFromConfig.mockReturnValue({});

          // When
          const result = await configSetup({ strapi });

          // Then
          expect(result.contentTypes).not.toContain(deletedContentType);
        });

        // TODO: test `validateAdditionalFields`
        it.todo('should check if custom fields config is valid');

        it('should save configuration details in database', async () => {
          // Given
          const allowedLevels = faker.number.int({
            min: 99,
            max: 200,
          });
          const cascadeMenuAttached = faker.datatype.boolean();
          const preferCustomContentTypes = faker.datatype.boolean();
          const isCacheEnabled = faker.datatype.boolean();

          getStore.mockReturnValue({
            allowedLevels,
            cascadeMenuAttached,
            preferCustomContentTypes,
            isCacheEnabled,
          });
          getFromConfig.mockReturnValue({});
          getContentTypes.mockReturnValue({});

          // When
          const result = await configSetup({ strapi });

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
