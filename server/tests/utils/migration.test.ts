import { faker } from '@faker-js/faker';
import { Core } from '@strapi/strapi';
import { removeNavigationsWithoutDefaultLocale } from '../../src/utils';
import { NavigationDTO } from '../../src/dtos';
import { asProxy } from '../utils';
import { getNavigationRepository } from '../../src/repositories';

jest.mock('../../src/repositories');

describe('Navigation', () => {
  describe('Utils', () => {
    describe('Migration', () => {
      const getMockNavigation = (extend: Partial<NavigationDTO> = {}): NavigationDTO => ({
        id: faker.number.int(),
        documentId: faker.string.uuid(),
        locale: 'en',
        name: faker.internet.domainWord(),
        slug: faker.internet.domainWord(),
        visible: faker.datatype.boolean(),
        items: [],
        ...extend,
      });

      const mockI18nService = {
        getDefaultLocale: jest.fn().mockResolvedValue('en'),
      };
      const mockStrapi = asProxy<Core.Strapi>({
        plugin: jest.fn().mockReturnValue({
          service: jest.fn().mockReturnValue(mockI18nService),
        }),
      });
      const mockRepository = {
        find: jest.fn(),
        remove: jest.fn(),
      };

      (getNavigationRepository as jest.Mock).mockReturnValue(mockRepository);

      beforeEach(() => {
        jest.clearAllMocks();
      });

      it('should not remove navigations that have a default locale root', async () => {
        // Given
        const defaultLocale = 'en';
        const otherLocale = 'fr';
        const documentId1 = faker.string.uuid();
        const documentId2 = faker.string.uuid();

        const navigations = [
          getMockNavigation({ documentId: documentId1, locale: defaultLocale }),
          getMockNavigation({ documentId: documentId1, locale: otherLocale }),
          getMockNavigation({ documentId: documentId2, locale: defaultLocale }),
          getMockNavigation({ documentId: documentId2, locale: otherLocale }),
        ];

        mockI18nService.getDefaultLocale.mockResolvedValue(defaultLocale);
        mockRepository.find.mockResolvedValue(navigations);

        // When
        await removeNavigationsWithoutDefaultLocale({ strapi: mockStrapi });

        // Then
        expect(mockRepository.find).toHaveBeenCalledWith({
          locale: '*',
          limit: Number.MAX_SAFE_INTEGER,
        });
        expect(mockI18nService.getDefaultLocale).toHaveBeenCalled();
        expect(mockRepository.remove).not.toHaveBeenCalled();
      });

      it('should remove navigations that do not have a default locale root', async () => {
        // Given
        const defaultLocale = 'en';
        const otherLocale = 'fr';
        const documentId1 = faker.string.uuid();
        const documentId2 = faker.string.uuid();

        const navigations = [
          getMockNavigation({ documentId: documentId1, locale: otherLocale }),
          getMockNavigation({ documentId: documentId2, locale: otherLocale }),
        ];

        mockI18nService.getDefaultLocale.mockResolvedValue(defaultLocale);
        mockRepository.find.mockResolvedValue(navigations);

        // When
        await removeNavigationsWithoutDefaultLocale({ strapi: mockStrapi });

        // Then
        expect(mockRepository.find).toHaveBeenCalledWith({
          locale: '*',
          limit: Number.MAX_SAFE_INTEGER,
        });
        expect(mockI18nService.getDefaultLocale).toHaveBeenCalled();
        expect(mockRepository.remove).toHaveBeenCalledTimes(2);
        expect(mockRepository.remove).toHaveBeenCalledWith({
          documentId: documentId1,
          locale: otherLocale,
        });
        expect(mockRepository.remove).toHaveBeenCalledWith({
          documentId: documentId2,
          locale: otherLocale,
        });
      });

      it('should remove only navigations without default locale when mixed with ones that have default locale', async () => {
        // Given
        const defaultLocale = 'en';
        const otherLocale = 'fr';
        const documentId1 = faker.string.uuid();
        const documentId2 = faker.string.uuid();
        const documentId3 = faker.string.uuid();

        const navigations = [
          getMockNavigation({ documentId: documentId1, locale: defaultLocale }),
          getMockNavigation({ documentId: documentId1, locale: otherLocale }),
          getMockNavigation({ documentId: documentId2, locale: otherLocale }),
          getMockNavigation({ documentId: documentId3, locale: defaultLocale }),
        ];

        mockI18nService.getDefaultLocale.mockResolvedValue(defaultLocale);
        mockRepository.find.mockResolvedValue(navigations);

        // When
        await removeNavigationsWithoutDefaultLocale({ strapi: mockStrapi });

        // Then
        expect(mockRepository.remove).toHaveBeenCalledTimes(1);
        expect(mockRepository.remove).toHaveBeenCalledWith({
          documentId: documentId2,
          locale: otherLocale,
        });
      });

      it('should handle empty navigations array', async () => {
        // Given
        const defaultLocale = 'en';
        mockI18nService.getDefaultLocale.mockResolvedValue(defaultLocale);
        mockRepository.find.mockResolvedValue([]);

        // When
        await removeNavigationsWithoutDefaultLocale({ strapi: mockStrapi });

        // Then
        expect(mockRepository.find).toHaveBeenCalled();
        expect(mockI18nService.getDefaultLocale).toHaveBeenCalled();
        expect(mockRepository.remove).not.toHaveBeenCalled();
      });

      it('should handle multiple locales for the same documentId without default locale', async () => {
        // Given
        const defaultLocale = 'en';
        const otherLocale1 = 'fr';
        const otherLocale2 = 'de';
        const documentId = faker.string.uuid();

        const navigations = [
          getMockNavigation({ documentId, locale: otherLocale1 }),
          getMockNavigation({ documentId, locale: otherLocale2 }),
        ];

        mockI18nService.getDefaultLocale.mockResolvedValue(defaultLocale);
        mockRepository.find.mockResolvedValue(navigations);

        // When
        await removeNavigationsWithoutDefaultLocale({ strapi: mockStrapi });

        // Then
        expect(mockRepository.remove).toHaveBeenCalledTimes(2);
        expect(mockRepository.remove).toHaveBeenCalledWith({
          documentId,
          locale: otherLocale1,
        });
        expect(mockRepository.remove).toHaveBeenCalledWith({
          documentId,
          locale: otherLocale2,
        });
      });

      it('should handle navigations with only default locale', async () => {
        // Given
        const defaultLocale = 'en';
        const documentId1 = faker.string.uuid();
        const documentId2 = faker.string.uuid();

        const navigations = [
          getMockNavigation({ documentId: documentId1, locale: defaultLocale }),
          getMockNavigation({ documentId: documentId2, locale: defaultLocale }),
        ];

        mockI18nService.getDefaultLocale.mockResolvedValue(defaultLocale);
        mockRepository.find.mockResolvedValue(navigations);

        // When
        await removeNavigationsWithoutDefaultLocale({ strapi: mockStrapi });

        // Then
        expect(mockRepository.remove).not.toHaveBeenCalled();
      });

      it('should handle different default locale', async () => {
        // Given
        const defaultLocale = 'fr';
        const otherLocale = 'en';
        const documentId = faker.string.uuid();

        const navigations = [
          getMockNavigation({ documentId, locale: defaultLocale }),
          getMockNavigation({ documentId, locale: otherLocale }),
        ];

        mockI18nService.getDefaultLocale.mockResolvedValue(defaultLocale);
        mockRepository.find.mockResolvedValue(navigations);

        // When
        await removeNavigationsWithoutDefaultLocale({ strapi: mockStrapi });

        // Then
        expect(mockRepository.remove).not.toHaveBeenCalled();
      });

      it('should process all navigations in parallel', async () => {
        // Given
        const defaultLocale = 'en';
        const otherLocale = 'fr';
        const documentId1 = faker.string.uuid();
        const documentId2 = faker.string.uuid();
        const documentId3 = faker.string.uuid();

        const navigations = [
          getMockNavigation({ documentId: documentId1, locale: otherLocale }),
          getMockNavigation({ documentId: documentId2, locale: otherLocale }),
          getMockNavigation({ documentId: documentId3, locale: otherLocale }),
        ];

        mockI18nService.getDefaultLocale.mockResolvedValue(defaultLocale);
        mockRepository.find.mockResolvedValue(navigations);
        mockRepository.remove.mockResolvedValue(undefined);

        // When
        await removeNavigationsWithoutDefaultLocale({ strapi: mockStrapi });

        // Then
        expect(mockRepository.remove).toHaveBeenCalledTimes(3);
      });

      it('should handle error when getDefaultLocale fails', async () => {
        // Given
        const error = new Error('Failed to get default locale');
        mockI18nService.getDefaultLocale.mockRejectedValue(error);
        mockRepository.find.mockResolvedValue([]);

        // When & Then
        await expect(removeNavigationsWithoutDefaultLocale({ strapi: mockStrapi })).rejects.toThrow(
          'Failed to get default locale'
        );
        expect(mockRepository.find).toHaveBeenCalled();
        expect(mockRepository.remove).not.toHaveBeenCalled();
      });

      it('should handle error when find fails', async () => {
        // Given
        const error = new Error('Failed to find navigations');
        const defaultLocale = 'en';
        mockI18nService.getDefaultLocale.mockResolvedValue(defaultLocale);
        mockRepository.find.mockRejectedValue(error);

        // When & Then
        await expect(removeNavigationsWithoutDefaultLocale({ strapi: mockStrapi })).rejects.toThrow(
          'Failed to find navigations'
        );
        expect(mockRepository.remove).not.toHaveBeenCalled();
      });
    });
  });
});
