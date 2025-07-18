"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ({ nexus }) => nexus.inputObjectType({
    name: 'CreateNavigation',
    definition(t) {
        t.nonNull.string('name');
        t.nonNull.list.field('items', { type: 'CreateNavigationItem' });
    },
});
