"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAudienceRepository = void 0;
const lodash_1 = require("lodash");
const schemas_1 = require("../schemas");
const utils_1 = require("../utils");
exports.getAudienceRepository = (0, lodash_1.once)((context) => ({
    find(where, limit) {
        const { audienceModel: { uid }, } = (0, utils_1.getPluginModels)(context);
        return context.strapi
            .query(uid)
            .findMany({ where, limit })
            .then(schemas_1.audienceDBSchema.array().parse);
    },
}));
