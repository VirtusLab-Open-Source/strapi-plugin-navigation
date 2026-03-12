import { faker } from '@faker-js/faker';
import { Core } from '@strapi/strapi';
import { getNavigationRepository } from '../../src/repositories';
import { getPluginModels } from '../../src/utils';
import { asProxy } from '../utils';

jest.mock('../../src/utils', () => ({
  ...jest.requireActual('../../src/utils'),
  getPluginModels: jest.fn(),
}));

describe('Navigation', () => {
  describe('Server', () => {
    describe('Repositories', () => {
      const getMockNavigationData = (extend: any = {}) => ({
        id: faker.number.int(),
        documentId: faker.string.uuid(),
        name: faker.internet.domainWord(),
        slug: faker.internet.domainWord(),
        locale: 'en',
        visible: faker.datatype.boolean(),
        items: [],
        ...extend,
      });

      const mockMasterModelUid = 'plugin::navigation.navigation';
      const mockDelete = jest.fn();
      const mockFindMany = jest.fn();
      const mockFindOne = jest.fn();
      const mockCreate = jest.fn();
      const mockUpdate = jest.fn();

      const mockDocuments = jest.fn().mockReturnValue({
        delete: mockDelete,
        findMany: mockFindMany,
        findOne: mockFindOne,
        create: mockCreate,
        update: mockUpdate,
      });
      const mockStrapi = asProxy<Core.Strapi>({
        documents: mockDocuments as any,
      });

      beforeEach(() => {
        jest.clearAllMocks();
        (getPluginModels as jest.Mock).mockReturnValue({
          masterModel: { uid: mockMasterModelUid },
        });
      });
      describe('find()', () => {
        it('should find navigations with filters, locale, and limit', async () => {
          // Given
          const filters = { visible: true };
          const locale = 'en';
          const limit = 10;
          const mockData = [getMockNavigationData()];
          mockFindMany.mockResolvedValue(mockData);

          const repository = getNavigationRepository({ strapi: mockStrapi });

          // When
          const result = await repository.find({ filters, locale, limit });

          // Then
          expect(mockFindMany).toHaveBeenCalledWith({
            filters,
            locale,
            limit,
            populate: undefined,
            orderBy: undefined,
          });
          expect(result).toHaveLength(1);
        });
      });
      describe('findOne()', () => {
        it('should find navigation by documentId', async () => {
          // Given
          const documentId = faker.string.uuid();
          const mockData = getMockNavigationData({ documentId });
          mockFindOne.mockResolvedValue(mockData);

          const repository = getNavigationRepository({ strapi: mockStrapi });

          // When
          const result = await repository.findOne({
            filters: { documentId },
          });

          // Then
          expect(mockDocuments).toHaveBeenCalledWith(mockMasterModelUid);
          expect(mockFindOne).toHaveBeenCalledWith({
            documentId,
            locale: undefined,
            populate: undefined,
          });
          expect(result).toBeDefined();
          expect(result.documentId).toBe(documentId);
        });
      });

      describe('save()', () => {
        it('should create a new navigation when documentId is not provided', async () => {
          // Given
          const navigationData = {
            name: faker.internet.domainWord(),
            visible: true,
            locale: 'en',
          };
          const mockCreated = getMockNavigationData(navigationData);
          mockCreate.mockResolvedValue(mockCreated);

          const repository = getNavigationRepository({ strapi: mockStrapi });

          // When
          const result = await repository.save(navigationData);

          // Then
          expect(mockDocuments).toHaveBeenCalledWith(mockMasterModelUid);
          expect(mockCreate).toHaveBeenCalledWith({
            locale: navigationData.locale,
            data: {
              name: navigationData.name,
              visible: navigationData.visible,
              populate: ['items'],
            },
          });
          expect(mockUpdate).not.toHaveBeenCalled();
          expect(result).toBeDefined();
        });

        it('should update an existing navigation when documentId is provided', async () => {
          // Given
          const documentId = faker.string.uuid();
          const navigationData = {
            documentId,
            name: faker.internet.domainWord(),
            visible: false,
            locale: 'en',
          };
          const mockUpdated = getMockNavigationData(navigationData);
          mockUpdate.mockResolvedValue(mockUpdated);

          const repository = getNavigationRepository({ strapi: mockStrapi });

          // When
          const result = await repository.save(navigationData);

          // Then
          expect(mockDocuments).toHaveBeenCalledWith(mockMasterModelUid);
          expect(mockUpdate).toHaveBeenCalledWith({
            locale: navigationData.locale,
            documentId,
            data: {
              name: navigationData.name,
              visible: navigationData.visible,
            },
            populate: ['items'],
          });
          expect(mockCreate).not.toHaveBeenCalled();
          expect(result).toBeDefined();
        });
        it('should handle parent.related as array (bug reproduction)', async () => {
          // Given - Strapi returns parent.related as an array (morphToMany behavior)
          const mockData = [
            getMockNavigationData({
              items: [
                {
                  id: 1,
                  documentId: 'item-1',
                  title: 'Parent Item',
                  type: 'INTERNAL',
                  path: '/parent',
                  uiRouterKey: 'parent',
                  menuAttached: false,
                  order: 0,
                  collapsed: false,
                  related: [{ documentId: 'rel-1', __type: 'api::author.author' }],
                  parent: null,
                },
                {
                  id: 2,
                  documentId: 'item-2',
                  title: 'Child Item',
                  type: 'INTERNAL',
                  path: '/child',
                  uiRouterKey: 'child',
                  menuAttached: false,
                  order: 0,
                  collapsed: false,
                  related: [{ documentId: 'rel-2', __type: 'api::author.author' }],
                  parent: {
                    id: 1,
                    documentId: 'item-1',
                    title: 'Parent Item',
                    type: 'INTERNAL',
                    path: '/parent',
                    uiRouterKey: 'parent',
                    menuAttached: false,
                    order: 0,
                    collapsed: false,
                    // related as an array
                    related: [{ documentId: 'rel-1', __type: 'api::author.author' }],
                  },
                },
              ],
            }),
          ];
          mockFindMany.mockResolvedValue(mockData);

          const repository = getNavigationRepository({ strapi: mockStrapi });

          // When & Then - This should NOT throw, but currently does with:
          // "Expected object, received array" at items[1].parent.related
          await expect(repository.find({ filters: {}, locale: 'en' })).resolves.toBeDefined();
        });
      });
      describe('remove()', () => {
        it('should delete navigation with documentId and locale', async () => {
          // Given
          const documentId = faker.string.uuid();
          const locale = 'en';

          mockDelete.mockResolvedValue(undefined);

          const repository = getNavigationRepository({ strapi: mockStrapi });

          // When
          await repository.remove({ documentId, locale });

          // Then
          expect(mockDocuments).toHaveBeenCalledWith(mockMasterModelUid);
          expect(mockDelete).toHaveBeenCalledWith({
            documentId,
            locale,
          });
        });
        it('should throw an error when there is no documentId', async () => {
          // Given
          const documentId = undefined;
          const locale = 'en';
          const repository = getNavigationRepository({ strapi: mockStrapi });

          // When & Then
          expect(() => repository.remove({ documentId, locale })).toThrow(
            'Document id is required.'
          );
          expect(mockDocuments).not.toHaveBeenCalled();
          expect(mockDelete).not.toHaveBeenCalled();
        });
      });
    });
  });
});
