"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const faker_1 = require("@faker-js/faker");
const lodash_1 = require("lodash");
const admin_1 = __importDefault(require("../../src/controllers/admin"));
const utils_1 = require("../../src/utils");
const utils_2 = require("../utils");
jest.mock('../../src/utils');
describe('Navigation', () => {
    describe('Server', () => {
        describe('Controller', () => {
            // Given
            const getMockNavigation = (extend = {}) => ({
                documentId: faker_1.faker.string.uuid(),
                id: faker_1.faker.number.int(),
                locale: 'en',
                name: faker_1.faker.internet.domainWord(),
                slug: faker_1.faker.internet.domainWord(),
                visible: faker_1.faker.datatype.boolean(),
                items: [],
                ...extend,
            });
            const strapi = (0, utils_2.asProxy)({});
            describe('get()', () => {
                it('should read all navigations', async () => {
                    // Given
                    const navigations = Array.from({
                        length: faker_1.faker.number.int({ min: 2, max: 5 }),
                    }).map(() => getMockNavigation());
                    const get = jest.fn();
                    const mockAdminService = (0, utils_2.asProxy)({ get });
                    get.mockReturnValue(navigations);
                    utils_1.getPluginService.mockReturnValue(mockAdminService);
                    const adminController = (0, admin_1.default)({ strapi });
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
                    const mockAdminService = (0, utils_2.asProxy)({
                        post: jest.fn(),
                    });
                    const mockNavigation = getMockNavigation();
                    const body = {
                        name: mockNavigation.name,
                        visible: mockNavigation.visible,
                    };
                    utils_1.getPluginService.mockReturnValue(mockAdminService);
                    const adminController = (0, admin_1.default)({ strapi });
                    // When
                    adminController.post((0, utils_2.asProxy)({
                        auditLog: auditLogMock,
                        request: (0, utils_2.asProxy)({
                            body,
                        }),
                    }));
                    // Then
                    expect(mockAdminService.post).toHaveBeenCalledWith({
                        payload: body,
                        auditLog: auditLogMock,
                    });
                });
                it('should handle an empty error', () => {
                    // Given
                    const auditLogMock = jest.fn();
                    const mockAdminService = (0, utils_2.asProxy)({
                        post: jest.fn().mockRejectedValue(undefined),
                    });
                    const mockNavigation = getMockNavigation();
                    const body = (0, lodash_1.omit)(mockNavigation, ['id', 'name']);
                    const documentId = faker_1.faker.string.uuid();
                    const internalServerErrorMock = jest.fn();
                    utils_1.getPluginService.mockReturnValue(mockAdminService);
                    const adminController = (0, admin_1.default)({ strapi });
                    // When
                    adminController.put((0, utils_2.asProxy)({
                        auditLog: auditLogMock,
                        params: { documentId },
                        request: (0, utils_2.asProxy)({
                            body,
                        }),
                        internalServerError: internalServerErrorMock,
                    }));
                    // Then
                    expect(internalServerErrorMock).toHaveBeenCalled();
                });
                it('should validate input', () => {
                    // Given
                    const auditLogMock = jest.fn();
                    const mockAdminService = (0, utils_2.asProxy)({
                        post: jest.fn(),
                    });
                    const mockNavigation = getMockNavigation();
                    const body = (0, lodash_1.omit)({
                        name: mockNavigation.name,
                        visible: mockNavigation.visible,
                    }, faker_1.faker.helpers.arrayElements(['name', 'visible'], { min: 1, max: 2 }));
                    const internalServerErrorMock = jest.fn();
                    utils_1.getPluginService.mockReturnValue(mockAdminService);
                    const adminController = (0, admin_1.default)({ strapi });
                    // When
                    adminController.post((0, utils_2.asProxy)({
                        auditLog: auditLogMock,
                        request: (0, utils_2.asProxy)({
                            body,
                        }),
                        // TODO: error handling; fix this test case
                        internalServerError: internalServerErrorMock,
                    }));
                    // Then
                    expect(internalServerErrorMock).toHaveBeenCalled();
                    expect(mockAdminService.post).not.toHaveBeenCalled();
                });
            });
            describe('put()', () => {
                it('should update navigation', () => {
                    // Given
                    const auditLogMock = jest.fn();
                    const mockAdminService = (0, utils_2.asProxy)({
                        put: jest.fn(),
                    });
                    const mockNavigation = getMockNavigation();
                    const documentId = faker_1.faker.string.uuid();
                    utils_1.getPluginService.mockReturnValue(mockAdminService);
                    const adminController = (0, admin_1.default)({ strapi });
                    // When
                    adminController.put((0, utils_2.asProxy)({
                        auditLog: auditLogMock,
                        params: { documentId },
                        request: (0, utils_2.asProxy)({
                            body: mockNavigation,
                        }),
                    }));
                    // Then
                    expect(mockAdminService.put).toHaveBeenCalledWith({
                        payload: {
                            ...mockNavigation,
                            documentId,
                        },
                        auditLog: auditLogMock,
                    });
                });
                it('should handle an empty error', () => {
                    // Given
                    const auditLogMock = jest.fn();
                    const mockAdminService = (0, utils_2.asProxy)({
                        put: jest.fn().mockRejectedValue(undefined),
                    });
                    const mockNavigation = getMockNavigation();
                    const body = (0, lodash_1.omit)(mockNavigation, ['id', 'name']);
                    const documentId = faker_1.faker.string.uuid();
                    const internalServerErrorMock = jest.fn();
                    utils_1.getPluginService.mockReturnValue(mockAdminService);
                    const adminController = (0, admin_1.default)({ strapi });
                    // When
                    adminController.put((0, utils_2.asProxy)({
                        auditLog: auditLogMock,
                        params: { documentId },
                        request: (0, utils_2.asProxy)({
                            body,
                        }),
                        internalServerError: internalServerErrorMock,
                    }));
                    // Then
                    expect(internalServerErrorMock).toHaveBeenCalled();
                });
                it('should validate input', () => {
                    // Given
                    const auditLogMock = jest.fn();
                    const mockAdminService = (0, utils_2.asProxy)({
                        put: jest.fn(),
                    });
                    const mockNavigation = getMockNavigation();
                    const body = (0, lodash_1.omit)(mockNavigation, ['id', 'name']);
                    const documentId = faker_1.faker.string.uuid();
                    const internalServerErrorMock = jest.fn();
                    utils_1.getPluginService.mockReturnValue(mockAdminService);
                    const adminController = (0, admin_1.default)({ strapi });
                    // When
                    adminController.put((0, utils_2.asProxy)({
                        auditLog: auditLogMock,
                        params: { documentId },
                        request: (0, utils_2.asProxy)({
                            body,
                        }),
                        internalServerError: internalServerErrorMock,
                    }));
                    // Then
                    expect(internalServerErrorMock).toHaveBeenCalled();
                    expect(mockAdminService.put).not.toHaveBeenCalled();
                });
            });
            describe('delete()', () => {
                it('should remove navigation', async () => {
                    // Given
                    const auditLogMock = jest.fn();
                    const mockAdminService = (0, utils_2.asProxy)({
                        delete: jest.fn(),
                    });
                    const documentId = faker_1.faker.string.uuid();
                    utils_1.getPluginService.mockReturnValue(mockAdminService);
                    const adminController = (0, admin_1.default)({ strapi });
                    // When
                    const result = await adminController.delete((0, utils_2.asProxy)({
                        auditLog: auditLogMock,
                        params: { documentId },
                    }));
                    // Then
                    expect(mockAdminService.delete).toHaveBeenCalledWith({
                        documentId,
                        auditLog: auditLogMock,
                    });
                    expect(result).toEqual({});
                });
                it('should validate input', async () => {
                    // Given
                    const auditLogMock = jest.fn();
                    const mockAdminService = (0, utils_2.asProxy)({
                        delete: jest.fn(),
                    });
                    const id = faker_1.faker.string.fromCharacters('fake-id-$', 30);
                    utils_1.getPluginService.mockReturnValue(mockAdminService);
                    const adminController = (0, admin_1.default)({ strapi });
                    // Then
                    await expect(async () => {
                        await adminController.delete((0, utils_2.asProxy)({
                            auditLog: auditLogMock,
                            params: { id },
                        }));
                    }).rejects.toThrow();
                    expect(mockAdminService.delete).not.toHaveBeenCalled();
                });
            });
            describe('config()', () => {
                it('should read config', async () => {
                    // Given
                    const mockConfig = (0, utils_2.asProxy)({
                        allowedLevels: faker_1.faker.number.int(),
                        preferCustomContentTypes: faker_1.faker.datatype.boolean(),
                    });
                    const mockAdminService = (0, utils_2.asProxy)({
                        config: jest.fn(),
                    });
                    mockAdminService.config.mockReturnValue(mockConfig);
                    utils_1.getPluginService.mockReturnValue(mockAdminService);
                    const adminController = (0, admin_1.default)({ strapi });
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
                    const mockConfig = (0, utils_2.asProxy)({
                        allowedLevels: faker_1.faker.number.int(),
                        preferCustomContentTypes: faker_1.faker.datatype.boolean(),
                    });
                    const mockAdminService = (0, utils_2.asProxy)({
                        config: jest.fn(),
                    });
                    mockAdminService.config.mockReturnValue(mockConfig);
                    utils_1.getPluginService.mockReturnValue(mockAdminService);
                    const adminController = (0, admin_1.default)({ strapi });
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
                    const nextConfig = {
                        additionalFields: ['audience'],
                        allowedLevels: faker_1.faker.number.int(),
                        cascadeMenuAttached: faker_1.faker.datatype.boolean(),
                        contentTypes: [],
                        contentTypesNameFields: {
                            default: [faker_1.faker.string.alphanumeric({ length: 15 })],
                        },
                        contentTypesPopulate: {},
                        gql: { navigationItemRelated: [] },
                        isCacheEnabled: faker_1.faker.datatype.boolean(),
                        pathDefaultFields: {},
                        preferCustomContentTypes: faker_1.faker.datatype.boolean(),
                    };
                    const mockAdminService = (0, utils_2.asProxy)({
                        updateConfig: jest.fn(),
                    });
                    utils_1.getPluginService.mockReturnValue(mockAdminService);
                    const adminController = (0, admin_1.default)({ strapi });
                    // When
                    const result = await adminController.updateConfig((0, utils_2.asProxy)({
                        request: (0, utils_2.asProxy)({
                            body: nextConfig,
                        }),
                    }));
                    // Then
                    expect(mockAdminService.updateConfig).toHaveBeenCalledWith({ config: nextConfig });
                    expect(result).toEqual({});
                });
                it('should validate input', async () => {
                    // Given
                    const nextConfig = (0, utils_2.asProxy)({
                        cascadeMenuAttached: faker_1.faker.datatype.boolean(),
                        contentTypes: [],
                        contentTypesNameFields: {
                            default: [faker_1.faker.string.alphanumeric({ length: 15 })],
                        },
                        contentTypesPopulate: {},
                        gql: { navigationItemRelated: [] },
                        isCacheEnabled: faker_1.faker.datatype.boolean(),
                        pathDefaultFields: {},
                        preferCustomContentTypes: faker_1.faker.datatype.boolean(),
                    });
                    const mockAdminService = (0, utils_2.asProxy)({
                        updateConfig: jest.fn(),
                    });
                    utils_1.getPluginService.mockReturnValue(mockAdminService);
                    const adminController = (0, admin_1.default)({ strapi });
                    // Then
                    await expect(async () => {
                        await adminController.updateConfig((0, utils_2.asProxy)({
                            request: (0, utils_2.asProxy)({
                                body: nextConfig,
                            }),
                        }));
                    }).rejects.toThrow();
                    expect(mockAdminService.updateConfig).not.toHaveBeenCalled();
                });
            });
            describe('restoreConfig()', () => {
                it('should restore config', async () => {
                    // Given
                    const mockAdminService = (0, utils_2.asProxy)({
                        restoreConfig: jest.fn(),
                    });
                    utils_1.getPluginService.mockReturnValue(mockAdminService);
                    const adminController = (0, admin_1.default)({ strapi });
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
                    const mockAdminService = (0, utils_2.asProxy)({
                        restart: jest.fn(),
                    });
                    utils_1.getPluginService.mockReturnValue(mockAdminService);
                    const adminController = (0, admin_1.default)({ strapi });
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
                    const mockAdminService = (0, utils_2.asProxy)({
                        getById,
                    });
                    const documentId = faker_1.faker.string.uuid();
                    const navigationMock = getMockNavigation();
                    utils_1.getPluginService.mockReturnValue(mockAdminService);
                    getById.mockReturnValue(navigationMock);
                    const adminController = (0, admin_1.default)({ strapi });
                    // When
                    const result = await adminController.getById((0, utils_2.asProxy)({
                        params: { documentId },
                    }));
                    // Then
                    expect(result).toEqual(result);
                });
                it('should validate input', async () => {
                    // Given
                    const getById = jest.fn();
                    const mockAdminService = (0, utils_2.asProxy)({
                        getById,
                    });
                    const documentId = faker_1.faker.number.int();
                    const navigationMock = getMockNavigation();
                    utils_1.getPluginService.mockReturnValue(mockAdminService);
                    getById.mockReturnValue(navigationMock);
                    const adminController = (0, admin_1.default)({ strapi });
                    // Then
                    await expect(async () => {
                        await adminController.getById((0, utils_2.asProxy)({
                            params: { documentId },
                        }));
                    }).rejects.toThrow();
                });
            });
            describe('getContentTypeItems()', () => {
                it('should return content types of a content type', async () => {
                    // Given
                    const items = [
                        { documentId: faker_1.faker.string.uuid() },
                        { documentId: faker_1.faker.string.uuid() },
                        { documentId: faker_1.faker.string.uuid() },
                        { documentId: faker_1.faker.string.uuid() },
                    ];
                    const getContentTypeItems = jest.fn();
                    const mockAdminService = (0, utils_2.asProxy)({
                        getContentTypeItems,
                    });
                    const model = faker_1.faker.string.sample(10);
                    utils_1.getPluginService.mockReturnValue(mockAdminService);
                    getContentTypeItems.mockReturnValue(items);
                    const adminController = (0, admin_1.default)({ strapi });
                    // When
                    const result = await adminController.getContentTypeItems((0, utils_2.asProxy)({
                        params: { model },
                    }));
                    // Then
                    expect(result).toEqual(items);
                });
                it('should validate input', async () => {
                    // Given
                    const getContentTypeItems = jest.fn();
                    const mockAdminService = (0, utils_2.asProxy)({
                        getContentTypeItems,
                    });
                    const model = undefined;
                    utils_1.getPluginService.mockReturnValue(mockAdminService);
                    const adminController = (0, admin_1.default)({ strapi });
                    // Then
                    await expect(async () => {
                        await adminController.getContentTypeItems((0, utils_2.asProxy)({
                            params: { model },
                        }));
                    }).rejects.toThrow();
                });
            });
            describe('fillFromOtherLocale()', () => {
                it('should copy navigation details from navigation to navigation', async () => {
                    // Given
                    const navigation = getMockNavigation();
                    const fillFromOtherLocale = jest.fn();
                    const mockAdminService = (0, utils_2.asProxy)({
                        fillFromOtherLocale,
                    });
                    const source = faker_1.faker.string.uuid();
                    const target = faker_1.faker.string.uuid();
                    const documentId = faker_1.faker.string.uuid();
                    const auditLog = jest.fn();
                    utils_1.getPluginService.mockReturnValue(mockAdminService);
                    fillFromOtherLocale.mockReturnValue(navigation);
                    const adminController = (0, admin_1.default)({ strapi });
                    // When
                    const result = await adminController.fillFromOtherLocale((0, utils_2.asProxy)({
                        params: { source, target, documentId },
                        auditLog,
                    }));
                    // Then
                    expect(result).toEqual(navigation);
                    expect(mockAdminService.fillFromOtherLocale).toHaveBeenCalledWith({
                        documentId,
                        source,
                        target,
                        auditLog,
                    });
                });
                it.each([
                    [faker_1.faker.string.sample(), undefined, faker_1.faker.string.sample()],
                    [undefined, faker_1.faker.string.sample(), faker_1.faker.string.sample()],
                    [faker_1.faker.string.sample(), faker_1.faker.string.sample(), undefined],
                ])('should validate input %s', async (documentId, source, target) => {
                    // Given
                    const navigationItem = getMockNavigation();
                    const fillFromOtherLocale = jest.fn();
                    const mockAdminService = (0, utils_2.asProxy)({
                        fillFromOtherLocale,
                    });
                    const auditLog = jest.fn();
                    utils_1.getPluginService.mockReturnValue(mockAdminService);
                    fillFromOtherLocale.mockReturnValue(navigationItem);
                    const adminController = (0, admin_1.default)({ strapi });
                    // Then
                    await expect(async () => {
                        await adminController.fillFromOtherLocale((0, utils_2.asProxy)({
                            params: { source, target, documentId },
                            auditLog,
                        }));
                    }).rejects.toThrow();
                });
            });
            describe('readNavigationItemFromLocale()', () => {
                it('should copy navigation item from navigation to navigation', async () => {
                    // Given
                    const navigationItem = (0, utils_2.asProxy)({
                        autoSync: faker_1.faker.datatype.boolean(),
                        path: faker_1.faker.string.sample(10),
                        title: faker_1.faker.lorem.words(3),
                    });
                    const readNavigationItemFromLocale = jest.fn();
                    const mockAdminService = (0, utils_2.asProxy)({
                        readNavigationItemFromLocale,
                    });
                    const source = faker_1.faker.string.uuid();
                    const target = faker_1.faker.string.uuid();
                    const path = faker_1.faker.string.sample(10);
                    utils_1.getPluginService.mockReturnValue(mockAdminService);
                    readNavigationItemFromLocale.mockReturnValue(navigationItem);
                    const adminController = (0, admin_1.default)({ strapi });
                    // When
                    const result = await adminController.readNavigationItemFromLocale((0, utils_2.asProxy)({
                        params: { source, target },
                        query: { path },
                    }));
                    // Then
                    expect(result).toEqual(navigationItem);
                });
                it('should validate input', async () => {
                    // Given
                    const navigationItem = (0, utils_2.asProxy)({
                        autoSync: faker_1.faker.datatype.boolean(),
                        path: faker_1.faker.string.sample(10),
                        title: faker_1.faker.lorem.words(3),
                    });
                    const readNavigationItemFromLocale = jest.fn();
                    const mockAdminService = (0, utils_2.asProxy)({
                        readNavigationItemFromLocale,
                    });
                    let [source, target] = faker_1.faker.helpers.shuffle([faker_1.faker.string.uuid(), undefined]);
                    let path = faker_1.faker.string.sample(10);
                    utils_1.getPluginService.mockReturnValue(mockAdminService);
                    readNavigationItemFromLocale.mockReturnValue(navigationItem);
                    const adminController = (0, admin_1.default)({ strapi });
                    // Then
                    await expect(async () => {
                        await adminController.readNavigationItemFromLocale((0, utils_2.asProxy)({
                            params: { source, target },
                            query: { path },
                        }));
                    }).rejects.toThrow();
                    // Given
                    source = faker_1.faker.string.uuid();
                    target = faker_1.faker.string.uuid();
                    path = faker_1.faker.helpers.arrayElement([undefined, undefined, {}]);
                    // Then
                    await expect(async () => {
                        await adminController.readNavigationItemFromLocale((0, utils_2.asProxy)({
                            params: { source, target },
                            query: { path },
                        }));
                    }).rejects.toThrow();
                });
            });
            describe('getSlug()', () => {
                it('should map a string to a slug', async () => {
                    // Given
                    const slug = faker_1.faker.string.sample(10);
                    const getSlug = jest.fn();
                    const mockCommonService = (0, utils_2.asProxy)({
                        getSlug,
                    });
                    const query = faker_1.faker.string.sample(10);
                    utils_1.getPluginService.mockReturnValue(mockCommonService);
                    getSlug.mockResolvedValue(slug);
                    const adminController = (0, admin_1.default)({ strapi });
                    // When
                    const result = await adminController.getSlug((0, utils_2.asProxy)({
                        query: { q: query },
                    }));
                    // Then
                    expect(result).toEqual({ slug });
                });
                it('should validate input', async () => {
                    // Given
                    const slug = faker_1.faker.string.sample(10);
                    const getSlug = jest.fn();
                    const mockCommonService = (0, utils_2.asProxy)({
                        getSlug,
                    });
                    const query = faker_1.faker.helpers.arrayElement([undefined, null, {}, []]);
                    utils_1.getPluginService.mockReturnValue(mockCommonService);
                    getSlug.mockResolvedValue(slug);
                    const adminController = (0, admin_1.default)({ strapi });
                    // Then
                    await expect(async () => {
                        await adminController.getSlug((0, utils_2.asProxy)({
                            query: { q: query },
                        }));
                    }).rejects.toThrow();
                });
            });
            describe('settingsLocale()', () => {
                it('should return current locale settings', async () => {
                    // Given
                    const defaultLocale = faker_1.faker.string.sample(10);
                    const restLocale = [
                        faker_1.faker.string.sample(10),
                        faker_1.faker.string.sample(10),
                        faker_1.faker.string.sample(10),
                    ];
                    const readLocale = jest.fn();
                    const mockCommonService = (0, utils_2.asProxy)({
                        readLocale,
                    });
                    utils_1.getPluginService.mockReturnValue(mockCommonService);
                    readLocale.mockResolvedValue({
                        defaultLocale,
                        restLocale,
                    });
                    const adminController = (0, admin_1.default)({ strapi });
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
