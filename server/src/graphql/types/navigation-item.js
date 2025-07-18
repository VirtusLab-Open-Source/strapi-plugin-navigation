"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ({ nexus, config }) => nexus.objectType({
    name: 'NavigationItem',
    definition(t) {
        t.nonNull.int('id');
        t.nonNull.string('documentId');
        t.nonNull.string('title');
        t.nonNull.field('type', { type: 'NavigationItemType' });
        t.string('path');
        t.string('externalPath');
        t.nonNull.string('uiRouterKey');
        t.nonNull.boolean('menuAttached');
        t.nonNull.int('order');
        t.field('parent', { type: 'NavigationItem' });
        t.string('master');
        t.list.field('items', { type: 'NavigationItem' });
        t.field('related', { type: 'NavigationItemRelated' });
        if (config.additionalFields.find((field) => field === 'audience')) {
            t.list.string('audience');
        }
        t.field('additionalFields', { type: 'NavigationItemAdditionalFields' });
        // SQL
        t.string('created_at');
        t.string('updated_at');
        t.string('created_by');
        t.string('updated_by');
        // MONGO
        t.string('createdAt');
        t.string('updatedAt');
        t.string('createdBy');
        t.string('updatedBy');
    },
});
