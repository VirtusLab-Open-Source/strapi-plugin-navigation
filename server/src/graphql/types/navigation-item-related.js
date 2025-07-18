"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ({ strapi, nexus, config }) => {
    var _a;
    const related = (_a = config.gql) === null || _a === void 0 ? void 0 : _a.navigationItemRelated;
    const name = 'NavigationItemRelated';
    if (related === null || related === void 0 ? void 0 : related.length) {
        return nexus.unionType({
            name,
            definition(t) {
                t.members(...related);
            },
            resolveType: (item) => {
                var _a;
                return (_a = strapi.contentTypes[item.__type]) === null || _a === void 0 ? void 0 : _a.globalId;
            },
        });
    }
    return nexus.objectType({
        name,
        definition(t) {
            t.int('id');
            t.string('documentId');
            t.string('title');
            t.string('name');
        },
    });
};
