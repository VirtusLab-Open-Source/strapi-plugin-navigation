"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ({ nexus, config }) => nexus.objectType({
    name: 'NavigationItemAdditionalFields',
    definition(t) {
        // Additional Fields
        config.additionalFields.forEach((field) => {
            if (field !== 'audience') {
                if (field.enabled) {
                    switch (field.type) {
                        case 'media':
                            t.field(field.name, { type: 'UploadFile' });
                            break;
                        case 'string':
                            t.string(field.name);
                            break;
                        case 'boolean':
                            t.boolean(field.name);
                            break;
                        case 'select':
                            if (field.multi)
                                t.list.string(field.name);
                            else
                                t.string(field.name);
                            break;
                        default:
                            throw new Error(`Type "${JSON.stringify(field.type)}" is unsupported by custom fields`);
                    }
                }
            }
        });
    },
});
