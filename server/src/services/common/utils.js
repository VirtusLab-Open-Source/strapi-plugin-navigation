"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDuplicatePath = void 0;
const app_errors_1 = require("../../app-errors");
const checkDuplicatePath = ({ checkData, parentItem, }) => {
    return new Promise((resolve, reject) => {
        if (parentItem && parentItem.items) {
            for (let item of checkData) {
                for (let _ of parentItem.items) {
                    if (_.path === item.path && _.id !== item.id && item.type === 'INTERNAL' && !_.removed) {
                        return reject(new app_errors_1.NavigationError(`Duplicate path:${item.path} in parent: ${parentItem.title || 'root'} for ${item.title} and ${_.title} items`, {
                            parentTitle: parentItem.title,
                            parentId: parentItem.id,
                            path: item.path,
                            errorTitles: [item.title, _.title],
                        }));
                    }
                }
            }
        }
        return resolve();
    });
};
exports.checkDuplicatePath = checkDuplicatePath;
