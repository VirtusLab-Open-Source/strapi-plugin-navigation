import { faker } from '@faker-js/faker';
import { Core } from '@strapi/strapi';

import { CreateBranchNavigationItemDTO } from '../../src/dtos';
import { getGenericRepository, getNavigationItemRepository } from '../../src/repositories';
import { NavigationDBSchema } from '../../src/schemas';
import commonService from '../../src/services/common/common';
import { generateFieldsFromRelated } from '../../src/services/common/utils';
import { getPluginService } from '../../src/utils';
import { asProxy } from '../utils';

jest.mock('../../src/repositories');
jest.mock('../../src/utils');

describe('CommonService', () => {
  const strapi = asProxy<Core.Strapi>({});

  describe('createBranch', () => {
    const mockSave = jest.fn();
    const mockAdminConfig = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();

      (getNavigationItemRepository as jest.Mock).mockReturnValue({ save: mockSave });

      (getPluginService as jest.Mock).mockReturnValue({
        config: mockAdminConfig,
      });

      mockAdminConfig.mockResolvedValue({
        contentTypesNameFields: {
          default: ['title', 'name'],
        },
        pathDefaultFields: {},
      });

      mockSave.mockImplementation(({ item }) =>
        Promise.resolve({ ...item, id: faker.number.int(), documentId: faker.string.uuid() })
      );
    });

    const getMasterEntity = (): NavigationDBSchema =>
      asProxy<NavigationDBSchema>({
        id: faker.number.int(),
        documentId: faker.string.uuid(),
        locale: 'en',
      });

    const getNewNavigationItem = (
      overrides: Partial<CreateBranchNavigationItemDTO> = {}
    ): CreateBranchNavigationItemDTO =>
      asProxy<CreateBranchNavigationItemDTO>({
        title: 'User Title',
        path: '/user-path',
        type: 'INTERNAL',
        autoSync: false,
        uiRouterKey: 'user-title',
        order: 1,
        collapsed: false,
        menuAttached: false,
        additionalFields: {},
        audience: [],
        items: [],
        related: {
          __type: 'api::article.article',
          documentId: faker.string.uuid(),
        },
        ...overrides,
      });

    it('should preserve user-provided title and path when autoSync is false', async () => {
      const service = commonService({ strapi });
      const masterEntity = getMasterEntity();
      const item = getNewNavigationItem({ autoSync: false });

      await service.createBranch({
        action: {},
        masterEntity,
        navigationItems: [item],
        parentItem: undefined,
      });

      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({
          item: expect.objectContaining({
            title: 'User Title',
            path: '/user-path',
          }),
        })
      );
    });

    it('should preserve user-provided title and path when autoSync is true and values are provided', async () => {
      const mockFindById = jest.fn().mockResolvedValue({
        id: 1,
        title: 'Auto Title from Related',
        name: 'auto-path',
      });
      (getGenericRepository as jest.Mock).mockReturnValue({ findById: mockFindById });

      const service = commonService({ strapi });
      const masterEntity = getMasterEntity();
      const item = getNewNavigationItem({
        autoSync: true,
        title: 'User Title',
        path: '/user-path',
      });

      await service.createBranch({
        action: {},
        masterEntity,
        navigationItems: [item],
        parentItem: undefined,
      });

      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({
          item: expect.objectContaining({
            title: 'User Title',
            path: '/user-path',
          }),
        })
      );
    });

    it('should use generated title and path when autoSync is true and values are empty', async () => {
      const mockFindById = jest.fn().mockResolvedValue({
        id: 42,
        title: 'Auto Title from Related',
      });
      (getGenericRepository as jest.Mock).mockReturnValue({ findById: mockFindById });

      const service = commonService({ strapi });
      const masterEntity = getMasterEntity();
      const item = getNewNavigationItem({
        autoSync: true,
        title: '',
        path: '',
      });

      await service.createBranch({
        action: {},
        masterEntity,
        navigationItems: [item],
        parentItem: undefined,
      });

      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({
          item: expect.objectContaining({
            title: 'Auto Title from Related',
            path: '42',
          }),
        })
      );
    });

    it('should not call generateFieldsFromRelated when autoSync is false', async () => {
      const mockFindById = jest.fn();
      (getGenericRepository as jest.Mock).mockReturnValue({ findById: mockFindById });

      const service = commonService({ strapi });
      const masterEntity = getMasterEntity();
      const item = getNewNavigationItem({ autoSync: false });

      await service.createBranch({
        action: {},
        masterEntity,
        navigationItems: [item],
        parentItem: undefined,
      });

      expect(mockFindById).not.toHaveBeenCalled();
    });

    it('should use generated values as fallback when autoSync is true and title/path are undefined', async () => {
      const mockFindById = jest.fn().mockResolvedValue({
        id: 7,
        title: 'Generated Title',
      });
      (getGenericRepository as jest.Mock).mockReturnValue({ findById: mockFindById });

      const service = commonService({ strapi });
      const masterEntity = getMasterEntity();
      const item = getNewNavigationItem({
        autoSync: true,
        title: undefined as any,
        path: undefined as any,
      });

      await service.createBranch({
        action: {},
        masterEntity,
        navigationItems: [item],
        parentItem: undefined,
      });

      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({
          item: expect.objectContaining({
            title: 'Generated Title',
            path: '7',
          }),
        })
      );
    });
  });

  describe('utils', () => {
    describe('generateFieldsFromRelated', () => {
      const mockFindById = jest.fn();

      beforeEach(() => {
        jest.clearAllMocks();
        (getGenericRepository as jest.Mock).mockReturnValue({
          findById: mockFindById,
        });
      });

      it('should return undefined for title and path when related is null', async () => {
        const result = await generateFieldsFromRelated(
          { strapi },
          null,
          'en',
          { default: ['title', 'name'] },
          {}
        );

        expect(result).toEqual({ title: undefined, path: undefined });
        expect(getGenericRepository).not.toHaveBeenCalled();
      });

      it('should return undefined for title and path when related is undefined', async () => {
        const result = await generateFieldsFromRelated(
          { strapi },
          undefined,
          'en',
          { default: ['title', 'name'] },
          {}
        );

        expect(result).toEqual({ title: undefined, path: undefined });
        expect(getGenericRepository).not.toHaveBeenCalled();
      });

      it('should derive title from default contentTypesNameFields when no content-type-specific fields are set', async () => {
        const relatedEntity = { id: 42, title: 'My Article', name: 'my-article' };
        mockFindById.mockResolvedValue(relatedEntity);

        const related = { __type: 'api::article.article', documentId: faker.string.uuid() };

        const result = await generateFieldsFromRelated(
          { strapi },
          related,
          'en',
          { default: ['title', 'subject', 'name'] },
          {}
        );

        expect(result.title).toBe('My Article');
      });

      it('should prefer content-type-specific name fields over defaults', async () => {
        const relatedEntity = { id: 42, title: 'ignored', subject: 'My Subject' };
        mockFindById.mockResolvedValue(relatedEntity);

        const related = { __type: 'api::article.article', documentId: faker.string.uuid() };

        const result = await generateFieldsFromRelated(
          { strapi },
          related,
          'en',
          {
            default: ['title'],
            'api::article.article': ['subject'],
          },
          {}
        );

        expect(result.title).toBe('My Subject');
      });

      it('should skip empty fields and use first truthy value for title', async () => {
        const relatedEntity = { id: 42, title: '', subject: '', name: 'Fallback Name' };
        mockFindById.mockResolvedValue(relatedEntity);

        const related = { __type: 'api::article.article', documentId: faker.string.uuid() };

        const result = await generateFieldsFromRelated(
          { strapi },
          related,
          'en',
          { default: ['title', 'subject', 'name'] },
          {}
        );

        expect(result.title).toBe('Fallback Name');
      });

      it('should derive path from pathDefaultFields when configured', async () => {
        const relatedEntity = { id: 42, name: 'My Article', slug: 'my-article' };
        mockFindById.mockResolvedValue(relatedEntity);

        const related = { __type: 'api::article.article', documentId: faker.string.uuid() };

        const result = await generateFieldsFromRelated(
          { strapi },
          related,
          'en',
          { default: ['name'] },
          { 'api::article.article': ['slug'] }
        );

        expect(result.path).toBe('my-article');
      });

      it('should fall back to entity id for path when pathDefaultFields is empty', async () => {
        const relatedEntity = { id: 99, name: 'My Article' };
        mockFindById.mockResolvedValue(relatedEntity);

        const related = { __type: 'api::article.article', documentId: faker.string.uuid() };

        const result = await generateFieldsFromRelated(
          { strapi },
          related,
          'en',
          { default: ['name'] },
          {}
        );

        expect(result.path).toBe('99');
      });

      it('should call repository with correct locale', async () => {
        const relatedEntity = { id: 1, title: 'Article' };
        mockFindById.mockResolvedValue(relatedEntity);

        const related = { __type: 'api::article.article', documentId: 'doc-123' };
        const locale = 'pl';

        await generateFieldsFromRelated({ strapi }, related, locale, { default: ['title'] }, {});

        expect(mockFindById).toHaveBeenCalledWith('doc-123', undefined, 'published', { locale });
      });
    });
  });
});
