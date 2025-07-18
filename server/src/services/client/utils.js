"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareArraysOfNumbers = exports.buildNestedPaths = exports.filterByPath = exports.extractItemRelationTitle = exports.composeItemTitle = void 0;
const lodash_1 = require("lodash");
const composeItemTitle = (item, fields = {}, contentTypes = []) => {
    const { title, related } = item;
    const lastRelated = (0, lodash_1.isArray)(related) ? (0, lodash_1.last)(related) : related;
    if (title) {
        return (0, lodash_1.isString)(title) && !(0, lodash_1.isEmpty)(title) ? title : undefined;
    }
    else if (lastRelated) {
        const relationTitle = (0, exports.extractItemRelationTitle)(lastRelated, fields, contentTypes);
        return (0, lodash_1.isString)(relationTitle) && !(0, lodash_1.isEmpty)(relationTitle) ? relationTitle : undefined;
    }
    return undefined;
};
exports.composeItemTitle = composeItemTitle;
const extractItemRelationTitle = (relatedItem, fields = {}, contentTypes = []) => {
    const { __contentType } = relatedItem;
    const contentType = (0, lodash_1.find)(contentTypes, (_) => _.contentTypeName === __contentType);
    const { default: defaultFields = [] } = fields;
    return ((0, lodash_1.get)(fields, `${contentType ? contentType.collectionName : ''}`, defaultFields)
        .map((_) => relatedItem[_])
        .filter((_) => _)[0] || '');
};
exports.extractItemRelationTitle = extractItemRelationTitle;
const filterByPath = (items, path) => {
    const parsedItems = (0, exports.buildNestedPaths)(items);
    const itemsWithPaths = path
        ? parsedItems.filter(({ path: itemPath }) => itemPath.includes(path))
        : parsedItems;
    const root = itemsWithPaths.find(({ path: itemPath }) => itemPath === path);
    return {
        root,
        items: (0, lodash_1.isNil)(root)
            ? []
            : items.filter(({ documentId }) => itemsWithPaths.find((v) => v.documentId === documentId)),
    };
};
exports.filterByPath = filterByPath;
const buildNestedPaths = (items, documentId, parentPath = null) => {
    return items
        .filter((entity) => {
        var _a;
        let data = entity.parent;
        if (!data == null && !documentId) {
            return true;
        }
        return ((_a = entity.parent) === null || _a === void 0 ? void 0 : _a.documentId) === documentId;
    })
        .reduce((acc, entity) => {
        var _a, _b, _c;
        const path = `${parentPath || ''}/${entity.path}`.replace('//', '/');
        return [
            {
                documentId: entity.documentId,
                parent: parentPath && ((_a = entity.parent) === null || _a === void 0 ? void 0 : _a.documentId)
                    ? {
                        id: (_b = entity.parent) === null || _b === void 0 ? void 0 : _b.id,
                        documentId: (_c = entity.parent) === null || _c === void 0 ? void 0 : _c.documentId,
                        path: parentPath,
                    }
                    : undefined,
                path,
            },
            ...(0, exports.buildNestedPaths)(items, entity.documentId, path),
            ...acc,
        ];
    }, []);
};
exports.buildNestedPaths = buildNestedPaths;
const compareArraysOfNumbers = (arrA, arrB) => {
    const diff = (0, lodash_1.zipWith)(arrA, arrB, (a, b) => {
        if ((0, lodash_1.isNil)(a))
            return -1;
        if ((0, lodash_1.isNil)(b))
            return 1;
        return a - b;
    });
    return (0, lodash_1.find)(diff, (a) => a !== 0) || 0;
};
exports.compareArraysOfNumbers = compareArraysOfNumbers;
