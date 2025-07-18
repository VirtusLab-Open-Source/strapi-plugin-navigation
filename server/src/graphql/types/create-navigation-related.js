"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ({ nexus }) => nexus.inputObjectType({
    name: 'CreateNavigationRelated',
    definition(t) {
        t.nonNull.string('ref');
        t.nonNull.string('field');
        t.nonNull.string('refId');
    },
});
