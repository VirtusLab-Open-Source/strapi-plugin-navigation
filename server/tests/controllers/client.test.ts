import { faker } from '@faker-js/faker';
import { Core } from '@strapi/strapi';
import { Context as KoaContext } from 'koa';

import buildClientController from '../../src/controllers/client';
import { NavigationDTO, NavigationItemDTO } from '../../src/dtos';
import { ClientService } from '../../src/services';
import { getPluginService } from '../../src/utils';
import { asProxy } from '../utils';

jest.mock('../../src/utils');

describe('Navigation', () => {
  describe('Server', () => {
    describe('Controller', () => {
      // Given
      const getMockNavigationItem = (
        extend: Partial<NavigationItemDTO> = {}
      ): NavigationItemDTO => ({
        additionalFields: {},
        collapsed: faker.datatype.boolean(),
        id: faker.number.int(),
        documentId: faker.string.uuid(),
        menuAttached: faker.datatype.boolean(),
        order: faker.number.int(),
        title: faker.string.sample(10),
        type: 'INTERNAL',
        uiRouterKey: faker.string.sample(10),
        path: faker.string.sample(10),
        ...extend,
      });
      const getMockNavigation = (extend: Partial<NavigationDTO> = {}): NavigationDTO => ({
        documentId: faker.string.uuid(),
        id: faker.number.int(),
        locale: 'en',
        name: faker.internet.domainWord(),
        slug: faker.internet.domainWord(),
        visible: faker.datatype.boolean(),
        items: [],
        ...extend,
      });
      const strapi = asProxy<Core.Strapi>({});

      describe('readAll()', () => {
        it('should return details', async () => {
          // Given
          const navigations = Array.from({
            length: faker.number.int({ min: 2, max: 5 }),
          }).map(() => getMockNavigation());
          const readAll = jest.fn();
          const mockClientService = asProxy<ClientService>({ readAll });

          readAll.mockResolvedValue(navigations);

          (getPluginService as jest.Mock).mockReturnValue(mockClientService);

          const clientController = buildClientController({ strapi });

          // When
          const result = await clientController.readAll(
            asProxy<KoaContext>({
              query: {
                locale: faker.location.countryCode(),
                orderBy: faker.string.sample(10),
                orderDirection: faker.helpers.arrayElement(['DESC', 'ASC']),
              },
            })
          );

          // Then
          expect(result).toEqual(navigations);
        });

        it('should NOT contain unhandled errors', async () => {
          // Given
          const readAll = jest.fn();
          const mockClientService = asProxy<ClientService>({ readAll });
          const someError = { type: 'UNKNOWN' };

          readAll.mockRejectedValue(someError);

          (getPluginService as jest.Mock).mockReturnValue(mockClientService);

          const clientController = buildClientController({ strapi });

          // Then
          await expect(async () => {
            await clientController.readAll(
              asProxy<KoaContext>({
                query: {
                  locale: faker.location.countryCode(),
                  orderBy: faker.string.sample(10),
                  orderDirection: faker.helpers.arrayElement(['DESC', 'ASC']),
                },
              })
            );
          }).rejects.toEqual(someError);
        });

        it('should validate input', async () => {
          // Given
          const navigations = Array.from({
            length: faker.number.int({ min: 2, max: 5 }),
          }).map(() => getMockNavigation());
          const readAll = jest.fn();
          const badRequest = jest.fn();
          const mockClientService = asProxy<ClientService>({ readAll });

          readAll.mockResolvedValue(navigations);
          badRequest.mockImplementation((message: string) => ({
            context: 'BAD_REQUEST',
            message,
          }));

          (getPluginService as jest.Mock).mockReturnValue(mockClientService);

          const clientController = buildClientController({ strapi });

          // Then
          const result = await clientController.readAll(
            asProxy<KoaContext>({
              query: {
                locale: faker.location.countryCode(),
                orderBy: faker.string.sample(10),
                orderDirection: faker.string.sample(10),
              },
              badRequest,
            })
          );

          expect(result).toEqual({
            context: 'BAD_REQUEST',
            message: expect.any(String),
          });
        });
      });

      describe('render()', () => {
        it('should return details', async () => {
          // Given
          const navigation = getMockNavigation();
          const render = jest.fn();
          const mockClientService = asProxy<ClientService>({ render });
          const idOrSlug = faker.string.uuid();
          const type = faker.helpers.arrayElement(['FLAT', 'TREE', 'RFR']);
          const menuOnly = faker.datatype.boolean();

          render.mockResolvedValue(navigation);

          (getPluginService as jest.Mock).mockReturnValue(mockClientService);

          const clientController = buildClientController({ strapi });

          // When
          const result = await clientController.render(
            asProxy<KoaContext>({
              params: { idOrSlug },
              query: {
                type,
                menuOnly,
              },
            })
          );

          // Then
          expect(result).toEqual(navigation);
        });

        it('should validate input', async () => {
          // Given
          const navigation = getMockNavigation();
          const render = jest.fn();
          const mockClientService = asProxy<ClientService>({ render });
          const idOrSlug = faker.string.uuid();
          const type = faker.helpers.arrayElement(['FLAT', 'TREE', 'RFR']);
          const menu = faker.datatype.boolean().toString();
          const query = faker.helpers.arrayElement([
            { type, menu: faker.string.sample() },
            { type: faker.string.sample(), menu },
          ]);

          render.mockResolvedValue(navigation);

          (getPluginService as jest.Mock).mockReturnValue(mockClientService);

          const clientController = buildClientController({ strapi });

          // Then
          await expect(async () => {
            await clientController.render(
              asProxy<KoaContext>({
                params: { idOrSlug },
                query,
              })
            );
          }).rejects.toThrow();
        });
      });

      describe('renderChild()', () => {
        it('should return details', async () => {
          // Given
          const navigationItem = getMockNavigationItem();
          const renderChildren = jest.fn();
          const mockClientService = asProxy<ClientService>({ renderChildren });
          const idOrSlug = faker.string.uuid();
          const childUIKey = faker.string.sample(10);
          const type = faker.helpers.arrayElement(['FLAT', 'TREE', 'RFR']);
          const menu = faker.datatype.boolean().toString();

          renderChildren.mockResolvedValue([navigationItem]);

          (getPluginService as jest.Mock).mockReturnValue(mockClientService);

          const clientController = buildClientController({ strapi });

          // When
          const result = await clientController.renderChild(
            asProxy<KoaContext>({
              params: { idOrSlug, childUIKey },
              query: {
                type,
                menu,
              },
            })
          );

          // Then
          expect(result).toEqual([navigationItem]);
        });

        it('should validate input', async () => {
          // Given
          const navigation = getMockNavigation();
          const render = jest.fn();
          const mockClientService = asProxy<ClientService>({ render });
          const documentId = faker.string.uuid();
          const childUIKey = faker.string.sample(10);
          const type = faker.helpers.arrayElement(['FLAT', 'TREE', 'RFR']);
          const menuOnly = faker.datatype.boolean();
          const query = faker.helpers.arrayElement([
            { type, menuOnly: faker.string.sample() },
            { type: faker.string.sample(), menuOnly },
          ]);

          render.mockResolvedValue(navigation);

          (getPluginService as jest.Mock).mockReturnValue(mockClientService);

          const clientController = buildClientController({ strapi });

          // Then
          await expect(async () => {
            await clientController.renderChild(
              asProxy<KoaContext>({
                params: { documentId, childUIKey },
                query,
              })
            );
          }).rejects.toThrow();
        });
      });
    });
  });
});
