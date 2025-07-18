"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGenericRepository = void 0;
const utils_1 = require("../utils");
const getGenericRepository = (context, uid) => ({
    findFirst(populate, status, extra = {}) {
        return context.strapi
            .documents(uid)
            .findFirst({ populate: (0, utils_1.parsePopulateQuery)(populate), status, ...extra });
    },
    findById(documentId, populate, status, extra = {}) {
        return context.strapi
            .documents(uid)
            .findOne({ documentId, populate: (0, utils_1.parsePopulateQuery)(populate), status, ...extra });
    },
    findManyById(documentIds, populate, status) {
        return context.strapi.documents(uid).findMany({
            where: { documentId: { $in: documentIds } },
            populate: (0, utils_1.parsePopulateQuery)(populate),
            status,
        });
    },
    findMany(where, populate, status, locale) {
        return context.strapi
            .documents(uid)
            .findMany({ where, populate: (0, utils_1.parsePopulateQuery)(populate), status, locale });
    },
    count(where, status) {
        return context.strapi.documents(uid).count({
            where,
            status,
        });
    },
});
exports.getGenericRepository = getGenericRepository;
