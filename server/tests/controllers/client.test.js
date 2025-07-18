"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const faker_1 = require("@faker-js/faker");
const client_1 = __importDefault(require("../../src/controllers/client"));
const utils_1 = require("../../src/utils");
const utils_2 = require("../utils");
jest.mock('../../src/utils');
describe('Navigation', () => {
    describe('Server', () => {
        describe('Controller', () => {
            // Given
            const getMockNavigationItem = (extend = {}) => ({
                additionalFields: {},
                collapsed: faker_1.faker.datatype.boolean(),
                id: faker_1.faker.number.int(),
                documentId: faker_1.faker.string.uuid(),
                menuAttached: faker_1.faker.datatype.boolean(),
                order: faker_1.faker.number.int(),
                title: faker_1.faker.string.sample(10),
                type: 'INTERNAL',
                uiRouterKey: faker_1.faker.string.sample(10),
                path: faker_1.faker.string.sample(10),
                ...extend,
            });
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
            describe('readAll()', () => {
                it('should return details', async () => {
                    // Given
                    const navigations = Array.from({
                        length: faker_1.faker.number.int({ min: 2, max: 5 }),
                    }).map(() => getMockNavigation());
                    const readAll = jest.fn();
                    const mockClientService = (0, utils_2.asProxy)({ readAll });
                    readAll.mockResolvedValue(navigations);
                    utils_1.getPluginService.mockReturnValue(mockClientService);
                    const clientController = (0, client_1.default)({ strapi });
                    // When
                    const result = await clientController.readAll((0, utils_2.asProxy)({
                        query: {
                            locale: faker_1.faker.location.countryCode(),
                            orderBy: faker_1.faker.string.sample(10),
                            orderDirection: faker_1.faker.helpers.arrayElement(['DESC', 'ASC']),
                        },
                    }));
                    // Then
                    expect(result).toEqual(navigations);
                });
                it('should NOT contain unhandled errors', async () => {
                    // Given
                    const readAll = jest.fn();
                    const mockClientService = (0, utils_2.asProxy)({ readAll });
                    const someError = { type: 'UNKNOWN' };
                    readAll.mockRejectedValue(someError);
                    utils_1.getPluginService.mockReturnValue(mockClientService);
                    const clientController = (0, client_1.default)({ strapi });
                    // Then
                    await expect(async () => {
                        await clientController.readAll((0, utils_2.asProxy)({
                            query: {
                                locale: faker_1.faker.location.countryCode(),
                                orderBy: faker_1.faker.string.sample(10),
                                orderDirection: faker_1.faker.helpers.arrayElement(['DESC', 'ASC']),
                            },
                        }));
                    }).rejects.toEqual(someError);
                });
                it('should validate input', async () => {
                    // Given
                    const navigations = Array.from({
                        length: faker_1.faker.number.int({ min: 2, max: 5 }),
                    }).map(() => getMockNavigation());
                    const readAll = jest.fn();
                    const badRequest = jest.fn();
                    const mockClientService = (0, utils_2.asProxy)({ readAll });
                    readAll.mockResolvedValue(navigations);
                    badRequest.mockImplementation((message) => ({
                        context: 'BAD_REQUEST',
                        message,
                    }));
                    utils_1.getPluginService.mockReturnValue(mockClientService);
                    const clientController = (0, client_1.default)({ strapi });
                    // Then
                    const result = await clientController.readAll((0, utils_2.asProxy)({
                        query: {
                            locale: faker_1.faker.location.countryCode(),
                            orderBy: faker_1.faker.string.sample(10),
                            orderDirection: faker_1.faker.string.sample(10),
                        },
                        badRequest,
                    }));
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
                    const mockClientService = (0, utils_2.asProxy)({ render });
                    const idOrSlug = faker_1.faker.string.uuid();
                    const type = faker_1.faker.helpers.arrayElement(['FLAT', 'TREE', 'RFR']);
                    const menuOnly = faker_1.faker.datatype.boolean();
                    render.mockResolvedValue(navigation);
                    utils_1.getPluginService.mockReturnValue(mockClientService);
                    const clientController = (0, client_1.default)({ strapi });
                    // When
                    const result = await clientController.render((0, utils_2.asProxy)({
                        params: { idOrSlug },
                        query: {
                            type,
                            menuOnly,
                        },
                    }));
                    // Then
                    expect(result).toEqual(navigation);
                });
                it('should validate input', async () => {
                    // Given
                    const navigation = getMockNavigation();
                    const render = jest.fn();
                    const mockClientService = (0, utils_2.asProxy)({ render });
                    const idOrSlug = faker_1.faker.string.uuid();
                    const type = faker_1.faker.helpers.arrayElement(['FLAT', 'TREE', 'RFR']);
                    const menu = faker_1.faker.datatype.boolean().toString();
                    const query = faker_1.faker.helpers.arrayElement([
                        { type, menu: faker_1.faker.string.sample() },
                        { type: faker_1.faker.string.sample(), menu },
                    ]);
                    render.mockResolvedValue(navigation);
                    utils_1.getPluginService.mockReturnValue(mockClientService);
                    const clientController = (0, client_1.default)({ strapi });
                    // Then
                    await expect(async () => {
                        await clientController.render((0, utils_2.asProxy)({
                            params: { idOrSlug },
                            query,
                        }));
                    }).rejects.toThrow();
                });
            });
            describe('renderChild()', () => {
                it('should return details', async () => {
                    // Given
                    const navigationItem = getMockNavigationItem();
                    const renderChildren = jest.fn();
                    const mockClientService = (0, utils_2.asProxy)({ renderChildren });
                    const documentId = faker_1.faker.string.uuid();
                    const childUIKey = faker_1.faker.string.sample(10);
                    const type = faker_1.faker.helpers.arrayElement(['FLAT', 'TREE', 'RFR']);
                    const menu = faker_1.faker.datatype.boolean().toString();
                    renderChildren.mockResolvedValue([navigationItem]);
                    utils_1.getPluginService.mockReturnValue(mockClientService);
                    const clientController = (0, client_1.default)({ strapi });
                    // When
                    const result = await clientController.renderChild((0, utils_2.asProxy)({
                        params: { documentId, childUIKey },
                        query: {
                            type,
                            menu,
                        },
                    }));
                    // Then
                    expect(result).toEqual([navigationItem]);
                });
                it('should validate input', async () => {
                    // Given
                    const navigation = getMockNavigation();
                    const render = jest.fn();
                    const mockClientService = (0, utils_2.asProxy)({ render });
                    const documentId = faker_1.faker.string.uuid();
                    const childUIKey = faker_1.faker.string.sample(10);
                    const type = faker_1.faker.helpers.arrayElement(['FLAT', 'TREE', 'RFR']);
                    const menuOnly = faker_1.faker.datatype.boolean();
                    const query = faker_1.faker.helpers.arrayElement([
                        { type, menuOnly: faker_1.faker.string.sample() },
                        { type: faker_1.faker.string.sample(), menuOnly },
                    ]);
                    render.mockResolvedValue(navigation);
                    utils_1.getPluginService.mockReturnValue(mockClientService);
                    const clientController = (0, client_1.default)({ strapi });
                    // Then
                    await expect(async () => {
                        await clientController.renderChild((0, utils_2.asProxy)({
                            params: { documentId, childUIKey },
                            query,
                        }));
                    }).rejects.toThrow();
                });
            });
        });
    });
});
