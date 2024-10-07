import { faker } from '@faker-js/faker/.';
import { Core } from '@strapi/types';
import { Context as KoaContext } from 'koa';
import { omit } from 'lodash';

import buildAdminController, { KoaContextExtension } from '../../src/controllers/admin';
import { NavigationDTO, NavigationPluginConfigDTO } from '../../src/dtos';
import { NavigationItemDBSchema } from '../../src/schemas';
import { ConfigSchema } from '../../src/schemas/config';
import { AdminService, CommonService } from '../../src/services';
import { getPluginModels, getPluginService } from '../../src/utils';
import { asProxy } from '../utils';

jest.mock('../../src/utils');

describe('Navigation', () => {
  describe('Server', () => {
    describe('Controller', () => {
      // Given
      const getMockNavigation = (extend: Partial<NavigationDTO> = {}): NavigationDTO => ({
        documentId: faker.string.uuid(),
        id: faker.number.int(),
        localeCode: 'en',
        name: faker.internet.domainWord(),
        slug: faker.internet.domainWord(),
        visible: faker.datatype.boolean(),
        items: [],
        ...extend,
      });
      const strapi = asProxy<Core.Strapi>({});

      describe('get()', () => {
        it('should read all navigations', async () => {
          // Given
          const navigations = Array.from({
            length: faker.number.int({ min: 2, max: 5 }),
          }).map(() => getMockNavigation());
          const get = jest.fn();
          const mockAdminService = asProxy<AdminService>({ get });

          get.mockReturnValue(navigations);

          (getPluginService as jest.Mock).mockReturnValue(mockAdminService);

          const adminController = buildAdminController({ strapi });

          // When
          const result = await adminController.get();

          // Then
          expect(result).toEqual(navigations);
        });
      });

      describe('post()', () => {
        it('should create a navigation', () => {
          // Given
          const auditLogMock = jest.fn();
          const mockAdminService = asProxy<AdminService>({
            post: jest.fn(),
          });
          const mockNavigation = getMockNavigation();
          const body = {
            name: mockNavigation.name,
            visible: mockNavigation.visible,
          };

          (getPluginService as jest.Mock).mockReturnValue(mockAdminService);

          const adminController = buildAdminController({ strapi });

          // When
          adminController.post(
            asProxy<KoaContext & KoaContextExtension>({
              auditLog: auditLogMock,
              request: asProxy<KoaContextExtension['request']>({
                body,
              }),
            })
          );

          // Then
          expect(mockAdminService.post).toHaveBeenCalledWith({
            payload: body,
            auditLog: auditLogMock,
          });
        });

        it('should validate input', () => {
          // Given
          const auditLogMock = jest.fn();
          const mockAdminService = asProxy<AdminService>({
            post: jest.fn(),
          });
          const mockNavigation = getMockNavigation();
          const body = omit(
            {
              name: mockNavigation.name,
              visible: mockNavigation.visible,
            },
            faker.helpers.arrayElements(['name', 'visible'], { min: 1, max: 2 })
          );

          (getPluginService as jest.Mock).mockReturnValue(mockAdminService);

          const adminController = buildAdminController({ strapi });

          // Then
          expect(() => {
            adminController.post(
              asProxy<KoaContext & KoaContextExtension>({
                auditLog: auditLogMock,
                request: asProxy<KoaContextExtension['request']>({
                  body,
                }),
              })
            );
          }).toThrow();
          expect(mockAdminService.post).not.toHaveBeenCalled();
        });
      });

      describe('put()', () => {
        it('should update navigation', () => {
          // Given
          const auditLogMock = jest.fn();
          const mockAdminService = asProxy<AdminService>({
            put: jest.fn(),
          });
          const mockNavigation = getMockNavigation();
          const id = faker.number.int({ min: 100, max: 999 });

          (getPluginService as jest.Mock).mockReturnValue(mockAdminService);

          const adminController = buildAdminController({ strapi });

          // When
          adminController.put(
            asProxy<KoaContext & KoaContextExtension>({
              auditLog: auditLogMock,
              params: { id },
              request: asProxy<KoaContextExtension['request']>({
                body: mockNavigation,
              }),
            })
          );

          // Then
          expect(mockAdminService.put).toHaveBeenCalledWith({
            payload: {
              ...mockNavigation,
              id,
            },
            auditLog: auditLogMock,
          });
        });

        it('should validate input', () => {
          // Given
          const auditLogMock = jest.fn();
          const mockAdminService = asProxy<AdminService>({
            put: jest.fn(),
          });
          const mockNavigation = getMockNavigation();
          const body = omit(
            mockNavigation,
            faker.helpers.arrayElements(Object.keys(mockNavigation), { min: 1, max: 4 })
          );
          const id = faker.string.alpha({ length: 20 });

          (getPluginService as jest.Mock).mockReturnValue(mockAdminService);

          const adminController = buildAdminController({ strapi });

          // Then
          expect(() => {
            adminController.put(
              asProxy<KoaContext & KoaContextExtension>({
                auditLog: auditLogMock,
                params: { id },
                request: asProxy<KoaContextExtension['request']>({
                  body,
                }),
              })
            );
          }).toThrow();
          expect(mockAdminService.put).not.toHaveBeenCalled();
        });
      });

      describe('delete()', () => {
        it('should remove navigation', async () => {
          // Given
          const auditLogMock = jest.fn();
          const mockAdminService = asProxy<AdminService>({
            delete: jest.fn(),
          });
          const id = faker.number.int({ min: 100, max: 999 });

          (getPluginService as jest.Mock).mockReturnValue(mockAdminService);

          const adminController = buildAdminController({ strapi });

          // When
          const result = await adminController.delete(
            asProxy<KoaContext>({
              auditLog: auditLogMock,
              params: { id },
            })
          );

          // Then
          expect(mockAdminService.delete).toHaveBeenCalledWith({
            id,
            auditLog: auditLogMock,
          });
          expect(result).toEqual({});
        });

        it('should validate input', async () => {
          // Given
          const auditLogMock = jest.fn();
          const mockAdminService = asProxy<AdminService>({
            delete: jest.fn(),
          });
          const id = faker.string.fromCharacters('fake-id-$', 30);

          (getPluginService as jest.Mock).mockReturnValue(mockAdminService);

          const adminController = buildAdminController({ strapi });

          // Then
          await expect(async () => {
            await adminController.delete(
              asProxy<KoaContext>({
                auditLog: auditLogMock,
                params: { id },
              })
            );
          }).rejects.toThrow();
          expect(mockAdminService.delete).not.toHaveBeenCalled();
        });
      });

      describe('config()', () => {
        it('should read config', async () => {
          // Given
          const mockConfig = asProxy<NavigationPluginConfigDTO>({
            allowedLevels: faker.number.int(),
            preferCustomContentTypes: faker.datatype.boolean(),
          });

          const mockAdminService = asProxy<AdminService>({
            config: jest.fn(),
          });

          (mockAdminService.config as jest.Mock).mockReturnValue(mockConfig);
          (getPluginService as jest.Mock).mockReturnValue(mockAdminService);

          const adminController = buildAdminController({ strapi });

          // When
          const result = await adminController.config();

          // Then
          expect(mockAdminService.config).toHaveBeenCalledWith({ viaSettingsPage: false });
          expect(result).toEqual(mockConfig);
        });
      });

      describe('settingsConfig()', () => {
        it('should read config', async () => {
          // Given
          const mockConfig = asProxy<NavigationPluginConfigDTO>({
            allowedLevels: faker.number.int(),
            preferCustomContentTypes: faker.datatype.boolean(),
          });

          const mockAdminService = asProxy<AdminService>({
            config: jest.fn(),
          });

          (mockAdminService.config as jest.Mock).mockReturnValue(mockConfig);
          (getPluginService as jest.Mock).mockReturnValue(mockAdminService);

          const adminController = buildAdminController({ strapi });

          // When
          const result = await adminController.settingsConfig();

          // Then
          expect(mockAdminService.config).toHaveBeenCalledWith({ viaSettingsPage: true });
          expect(result).toEqual(mockConfig);
        });
      });

      describe('updateConfig()', () => {
        it('should update config', async () => {
          // Given
          const nextConfig: ConfigSchema = {
            additionalFields: ['audience'],
            allowedLevels: faker.number.int(),
            cascadeMenuAttached: faker.datatype.boolean(),
            contentTypes: [],
            contentTypesNameFields: {
              default: [faker.string.alphanumeric({ length: 15 })],
            },
            contentTypesPopulate: {},
            gql: { navigationItemRelated: [] },
            isCacheEnabled: faker.datatype.boolean(),
            pathDefaultFields: {},
            preferCustomContentTypes: faker.datatype.boolean(),
          };
          const mockAdminService = asProxy<AdminService>({
            updateConfig: jest.fn(),
          });

          (getPluginService as jest.Mock).mockReturnValue(mockAdminService);

          const adminController = buildAdminController({ strapi });

          // When
          const result = await adminController.updateConfig(
            asProxy<KoaContext & KoaContextExtension>({
              request: asProxy<KoaContextExtension['request']>({
                body: nextConfig,
              }),
            })
          );

          // Then
          expect(mockAdminService.updateConfig).toHaveBeenCalledWith({ config: nextConfig });
          expect(result).toEqual({});
        });

        it('should validate input', async () => {
          // Given
          const nextConfig = asProxy<ConfigSchema>({
            cascadeMenuAttached: faker.datatype.boolean(),
            contentTypes: [],
            contentTypesNameFields: {
              default: [faker.string.alphanumeric({ length: 15 })],
            },
            contentTypesPopulate: {},
            gql: { navigationItemRelated: [] },
            isCacheEnabled: faker.datatype.boolean(),
            pathDefaultFields: {},
            preferCustomContentTypes: faker.datatype.boolean(),
          });
          const mockAdminService = asProxy<AdminService>({
            updateConfig: jest.fn(),
          });

          (getPluginService as jest.Mock).mockReturnValue(mockAdminService);

          const adminController = buildAdminController({ strapi });

          // Then
          await expect(async () => {
            await adminController.updateConfig(
              asProxy<KoaContext & KoaContextExtension>({
                request: asProxy<KoaContextExtension['request']>({
                  body: nextConfig,
                }),
              })
            );
          }).rejects.toThrow();
          expect(mockAdminService.updateConfig).not.toHaveBeenCalled();
        });
      });

      describe('restoreConfig()', () => {
        it('should restore config', async () => {
          // Given
          const mockAdminService = asProxy<AdminService>({
            restoreConfig: jest.fn(),
          });

          (getPluginService as jest.Mock).mockReturnValue(mockAdminService);

          const adminController = buildAdminController({ strapi });

          // When
          const result = await adminController.restoreConfig();

          // Then
          expect(mockAdminService.restoreConfig).toHaveBeenCalled();
          expect(result).toEqual({});
        });
      });

      describe('settingsRestart()', () => {
        it('should start system restart', async () => {
          // Given
          const mockAdminService = asProxy<AdminService>({
            restart: jest.fn(),
          });

          (getPluginService as jest.Mock).mockReturnValue(mockAdminService);

          const adminController = buildAdminController({ strapi });

          // When
          const result = await adminController.settingsRestart();

          // Then
          expect(mockAdminService.restart).toHaveBeenCalled();
          expect(result).toEqual({});
        });
      });

      describe('getId()', () => {
        it('should read a navigation', async () => {
          // Given
          const getById = jest.fn();
          const mockAdminService = asProxy<AdminService>({
            getById,
          });
          const id = faker.number.int({ min: 22, max: 99 });
          const navigationMock = getMockNavigation();

          (getPluginService as jest.Mock).mockReturnValue(mockAdminService);
          getById.mockReturnValue(navigationMock);

          const adminController = buildAdminController({ strapi });

          // When
          const result = await adminController.getById(
            asProxy<KoaContext>({
              params: { id },
            })
          );

          // Then
          expect(result).toEqual(result);
        });

        it('should validate input', async () => {
          // Given
          const getById = jest.fn();
          const mockAdminService = asProxy<AdminService>({
            getById,
          });
          const id = faker.string.fromCharacters('fake-id', 10);
          const navigationMock = getMockNavigation();

          (getPluginService as jest.Mock).mockReturnValue(mockAdminService);
          getById.mockReturnValue(navigationMock);

          const adminController = buildAdminController({ strapi });

          // Then
          expect(async () => {
            await adminController.getById(
              asProxy<KoaContext>({
                params: { id },
              })
            );
          }).rejects.toThrow();
        });
      });

      describe('getContentTypeItems()', () => {
        it('should return content types of a content type', async () => {
          // Given
          const items = [
            { id: faker.number.int() },
            { id: faker.number.int() },
            { id: faker.number.int() },
            { id: faker.number.int() },
          ];
          const getContentTypeItems = jest.fn();
          const mockAdminService = asProxy<AdminService>({
            getContentTypeItems,
          });
          const model = faker.string.sample(10);

          (getPluginService as jest.Mock).mockReturnValue(mockAdminService);
          getContentTypeItems.mockReturnValue(items);

          const adminController = buildAdminController({ strapi });

          // When
          const result = await adminController.getContentTypeItems(
            asProxy<KoaContext>({
              params: { model },
            })
          );

          // Then
          expect(result).toEqual(items);
        });

        it('should validate input', async () => {
          // Given
          const getContentTypeItems = jest.fn();
          const mockAdminService = asProxy<AdminService>({
            getContentTypeItems,
          });
          const model = undefined;

          (getPluginService as jest.Mock).mockReturnValue(mockAdminService);

          const adminController = buildAdminController({ strapi });

          // Then
          expect(async () => {
            await adminController.getContentTypeItems(
              asProxy<KoaContext>({
                params: { model },
              })
            );
          }).rejects.toThrow();
        });
      });

      describe('fillFromOtherLocale()', () => {
        it('should copy navigation details from navigation to navigation', async () => {
          // Given
          const navigation = getMockNavigation();
          const fillFromOtherLocale = jest.fn();
          const mockAdminService = asProxy<AdminService>({
            fillFromOtherLocale,
          });
          const source = faker.number.int();
          const target = faker.number.int();
          const auditLog = jest.fn();

          (getPluginService as jest.Mock).mockReturnValue(mockAdminService);
          fillFromOtherLocale.mockReturnValue(navigation);

          const adminController = buildAdminController({ strapi });

          // When
          const result = await adminController.fillFromOtherLocale(
            asProxy<KoaContext>({
              params: { source, target },
              auditLog,
            })
          );

          // Then
          expect(result).toEqual(navigation);
          expect(mockAdminService.fillFromOtherLocale).toHaveBeenCalledWith({
            source,
            target,
            auditLog,
          });
        });

        it('should validate input', async () => {
          // Given
          const navigationItem = getMockNavigation();
          const fillFromOtherLocale = jest.fn();
          const mockAdminService = asProxy<AdminService>({
            fillFromOtherLocale,
          });
          const [source, target] = faker.helpers.shuffle([faker.number.int(), undefined]);
          const auditLog = jest.fn();

          (getPluginService as jest.Mock).mockReturnValue(mockAdminService);
          fillFromOtherLocale.mockReturnValue(navigationItem);

          const adminController = buildAdminController({ strapi });

          // Then
          expect(async () => {
            await adminController.fillFromOtherLocale(
              asProxy<KoaContext>({
                params: { source, target },
                auditLog,
              })
            );
          }).rejects.toThrow();
        });
      });

      describe('fillFromOtherLocale()', () => {
        it('should copy navigation item from navigation to navigation', async () => {
          // Given
          const navigationItem = asProxy<NavigationItemDBSchema>({
            autoSync: faker.datatype.boolean(),
            path: faker.string.sample(10),
            title: faker.lorem.words(3),
          });
          const readNavigationItemFromLocale = jest.fn();
          const mockAdminService = asProxy<AdminService>({
            readNavigationItemFromLocale,
          });
          const source = faker.number.int();
          const target = faker.number.int();
          const path = faker.string.sample(10);

          (getPluginService as jest.Mock).mockReturnValue(mockAdminService);
          readNavigationItemFromLocale.mockReturnValue(navigationItem);

          const adminController = buildAdminController({ strapi });

          // When
          const result = await adminController.readNavigationItemFromLocale(
            asProxy<KoaContext>({
              params: { source, target },
              query: { path },
            })
          );

          // Then
          expect(result).toEqual(navigationItem);
        });

        it('should validate input', async () => {
          // Given
          const navigationItem = asProxy<NavigationItemDBSchema>({
            autoSync: faker.datatype.boolean(),
            path: faker.string.sample(10),
            title: faker.lorem.words(3),
          });
          const readNavigationItemFromLocale = jest.fn();
          const mockAdminService = asProxy<AdminService>({
            readNavigationItemFromLocale,
          });
          let [source, target] = faker.helpers.shuffle([faker.number.int(), undefined]);
          let path: unknown = faker.string.sample(10);

          (getPluginService as jest.Mock).mockReturnValue(mockAdminService);
          readNavigationItemFromLocale.mockReturnValue(navigationItem);

          const adminController = buildAdminController({ strapi });

          // Then
          expect(async () => {
            await adminController.readNavigationItemFromLocale(
              asProxy<KoaContext>({
                params: { source, target },
                query: { path },
              })
            );
          }).rejects.toThrow();

          // Given
          source = faker.number.int();
          target = faker.number.int();
          path = faker.helpers.arrayElement([undefined, undefined, faker.number.int(), {}]);

          // Then
          expect(async () => {
            await adminController.readNavigationItemFromLocale(
              asProxy<KoaContext>({
                params: { source, target },
                query: { path },
              })
            );
          }).rejects.toThrow();
        });
      });

      describe('getSlug()', () => {
        it('should map a string to a slug', async () => {
          // Given
          const slug = faker.string.sample(10);
          const getSlug = jest.fn();
          const mockCommonService = asProxy<CommonService>({
            getSlug,
          });
          const query = faker.string.sample(10);

          (getPluginService as jest.Mock).mockReturnValue(mockCommonService);
          getSlug.mockResolvedValue(slug);

          const adminController = buildAdminController({ strapi });

          // When
          const result = await adminController.getSlug(
            asProxy<KoaContext>({
              query: { q: query },
            })
          );

          // Then
          expect(result).toEqual({ slug });
        });

        it('should validate input', async () => {
          // Given
          const slug = faker.string.sample(10);
          const getSlug = jest.fn();
          const mockCommonService = asProxy<CommonService>({
            getSlug,
          });
          const query: unknown = faker.helpers.arrayElement([
            undefined,
            null,
            {},
            [],
            faker.number.int(),
          ]);

          (getPluginService as jest.Mock).mockReturnValue(mockCommonService);
          getSlug.mockResolvedValue(slug);

          const adminController = buildAdminController({ strapi });

          // Then
          expect(async () => {
            await adminController.getSlug(
              asProxy<KoaContext>({
                query: { q: query },
              })
            );
          }).rejects.toThrow();
        });
      });

      describe('settingsLocale()', () => {
        it('should return current locale settings', async () => {
          // Given
          const defaultLocale = faker.string.sample(10);
          const restLocale = [
            faker.string.sample(10),
            faker.string.sample(10),
            faker.string.sample(10),
          ];
          const readLocale = jest.fn();
          const mockCommonService = asProxy<CommonService>({
            readLocale,
          });

          (getPluginService as jest.Mock).mockReturnValue(mockCommonService);
          readLocale.mockResolvedValue({
            defaultLocale,
            restLocale,
          });

          const adminController = buildAdminController({ strapi });

          // When
          const result = await adminController.settingsLocale();

          // Then
          expect(result).toEqual({
            defaultLocale,
            restLocale,
          });
        });
      });

    });
  });
});
