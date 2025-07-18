"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseId = exports.sanitizePopulateField = void 0;
const zod_1 = require("zod");
const validators_1 = require("./validators");
const sanitizePopulateField = (populate) => {
    if (!populate || populate === true || populate === '*') {
        return undefined;
    }
    if ('object' === typeof populate) {
        return undefined;
    }
    if (Array.isArray(populate)) {
        return populate;
    }
    return populate;
};
exports.sanitizePopulateField = sanitizePopulateField;
const parseId = (id) => {
    return Number.isNaN(parseInt(id)) ? zod_1.z.string().parse(id) : validators_1.idSchema.parse(parseInt(id));
};
exports.parseId = parseId;
