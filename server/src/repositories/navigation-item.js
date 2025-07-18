"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flattenRelated = exports.removeSensitiveFields = exports.getNavigationItemRepository = void 0;
const lodash_1 = require("lodash");
const schemas_1 = require("../schemas");
const utils_1 = require("../utils");
const generic_1 = require("./generic");
exports.getNavigationItemRepository = (0, lodash_1.once)((context) => ({
    async save({ item, locale }) {
        var _a;
        const { itemModel } = (0, utils_1.getPluginModels)(context);
        const { __type, documentId } = (_a = item === null || item === void 0 ? void 0 : item.related) !== null && _a !== void 0 ? _a : {};
        const repository = __type
            ? (0, generic_1.getGenericRepository)(context, __type)
            : undefined;
        const related = __type && repository
            ? documentId
                ? await repository.findById(documentId, undefined, undefined, { locale })
                : await repository.findFirst(undefined, undefined, { locale })
            : undefined;
        if (typeof item.documentId === 'string') {
            const { documentId, ...rest } = item;
            return context.strapi.documents(itemModel.uid).update({
                documentId: item.documentId,
                data: {
                    ...rest,
                    related: related ? { ...related, __type } : undefined,
                },
                locale,
            });
        }
        else {
            return context.strapi.documents(itemModel.uid).create({
                data: {
                    ...item,
                    related: related ? { ...related, __type } : undefined,
                },
                locale,
            });
        }
    },
    find({ filters, locale, limit, order, populate }) {
        const { itemModel } = (0, utils_1.getPluginModels)(context);
        return context.strapi
            .documents(itemModel.uid)
            .findMany({ filters, locale, limit, populate, orderBy: order })
            .then((items) => items.map(exports.flattenRelated))
            .then(schemas_1.navigationItemsDBSchema.parse)
            .then((items) => items.map(exports.removeSensitiveFields));
    },
    findV4({ filters, locale, limit, order, populate }) {
        const { itemModel } = (0, utils_1.getPluginModels)(context);
        return context.strapi
            .documents(itemModel.uid)
            .findMany({ filters, locale, limit, populate, orderBy: order });
    },
    count(where) {
        const { itemModel } = (0, utils_1.getPluginModels)(context);
        return context.strapi.query(itemModel.uid).count({ where });
    },
    remove(item) {
        const { itemModel } = (0, utils_1.getPluginModels)(context);
        return context.strapi.documents(itemModel.uid).delete({
            documentId: item.documentId,
            populate: '*',
        });
    },
    removeForIds(ids) {
        const { itemModel } = (0, utils_1.getPluginModels)(context);
        return ids.map((id) => context.strapi.documents(itemModel.uid).delete({ documentId: id, populate: '*' }));
    },
    findForMasterIds(ids) {
        const { itemModel } = (0, utils_1.getPluginModels)(context);
        return context.strapi
            .query(itemModel.uid)
            .findMany({
            where: {
                $or: ids.map((id) => ({ master: id })),
            },
            limit: Number.MAX_SAFE_INTEGER,
        })
            .then(schemas_1.navigationItemsDBSchema.parse);
    },
}));
const sensitiveFields = ['id', 'publishedAt', 'createdAt', 'updatedAt', 'locale'];
const removeSensitiveFields = ({ related, items = [], ...item }) => ({
    ...item,
    items: items.map(exports.removeSensitiveFields),
    related: related
        ? (0, lodash_1.omit)(related, sensitiveFields)
        : undefined,
});
exports.removeSensitiveFields = removeSensitiveFields;
const flattenRelated = ({ related, ...item }) => ({
    ...item,
    related: related === null || related === void 0 ? void 0 : related[0],
});
exports.flattenRelated = flattenRelated;
