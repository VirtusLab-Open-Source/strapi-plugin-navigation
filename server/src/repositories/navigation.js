"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNavigationRepository = void 0;
const lodash_1 = require("lodash");
const app_errors_1 = require("../app-errors");
const schemas_1 = require("../schemas");
const utils_1 = require("../utils");
const navigation_item_1 = require("./navigation-item");
const calculateItemsRequirement = (populate) => {
    return populate === true ? true : Array.isArray(populate) ? populate.includes('items') : false;
};
exports.getNavigationRepository = (0, lodash_1.once)((context) => ({
    find({ filters, locale, limit, orderBy, populate }) {
        const { masterModel } = (0, utils_1.getPluginModels)(context);
        return context.strapi
            .documents(masterModel.uid)
            .findMany({ filters, locale, limit, populate, orderBy })
            .then((data) => data.map(({ items, ...navigation }) => ({
            ...navigation,
            items: items === null || items === void 0 ? void 0 : items.map(navigation_item_1.flattenRelated),
        })))
            .then((data) => data.map(({ items, ...navigation }) => ({
            ...navigation,
            items: items === null || items === void 0 ? void 0 : items.map(navigation_item_1.removeSensitiveFields),
        })))
            .then((data) => {
            return (0, schemas_1.navigationDBSchema)(calculateItemsRequirement(populate)).array().parse(data);
        });
    },
    findOne({ locale, filters, populate }) {
        const { masterModel } = (0, utils_1.getPluginModels)(context);
        return context.strapi
            .documents(masterModel.uid)
            .findOne({ documentId: filters.documentId, locale, populate })
            .then((data) => { var _a; return (data ? { ...data, items: (_a = data.items) === null || _a === void 0 ? void 0 : _a.map(navigation_item_1.flattenRelated) } : data); })
            .then((data) => {
            return (0, schemas_1.navigationDBSchema)(calculateItemsRequirement(populate)).parse(data);
        })
            .then((navigation) => {
            var _a;
            return ({
                ...navigation,
                items: (_a = navigation.items) === null || _a === void 0 ? void 0 : _a.map(navigation_item_1.removeSensitiveFields),
            });
        });
    },
    async save(navigation) {
        const { masterModel } = (0, utils_1.getPluginModels)(context);
        const { documentId, locale, ...rest } = navigation;
        if (documentId) {
            return context.strapi
                .documents(masterModel.uid)
                .update({
                locale,
                documentId: documentId,
                data: (0, lodash_1.omit)(rest, ['id', 'documentId']),
                populate: ['items'],
            })
                .then((0, schemas_1.navigationDBSchema)(false).parse);
        }
        else {
            return context.strapi
                .documents(masterModel.uid)
                .create({
                locale,
                data: {
                    ...rest,
                    populate: ['items'],
                },
            })
                .then((0, schemas_1.navigationDBSchema)(false).parse);
        }
    },
    remove(navigation) {
        const { masterModel } = (0, utils_1.getPluginModels)(context);
        if (!navigation.documentId) {
            throw new app_errors_1.NavigationError('Document id is required.');
        }
        return context.strapi.documents(masterModel.uid).delete({ documentId: navigation.documentId });
    },
}));
