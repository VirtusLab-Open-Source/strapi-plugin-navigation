"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ({ nexus }) => nexus.objectType({
    name: 'Navigation',
    definition(t) {
        t.nonNull.string('id');
        t.nonNull.string('documentId');
        t.nonNull.string('name');
        t.nonNull.string('slug');
        t.nonNull.boolean('visible');
    },
});
