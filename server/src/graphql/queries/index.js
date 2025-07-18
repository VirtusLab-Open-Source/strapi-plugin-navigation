"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQueries = void 0;
const render_navigation_1 = require("./render-navigation");
const render_navigation_child_1 = require("./render-navigation-child");
const getQueries = (context) => {
    const queries = {
        renderNavigationChild: render_navigation_child_1.renderNavigationChild,
        renderNavigation: render_navigation_1.renderNavigation,
    };
    return context.nexus.extendType({
        type: 'Query',
        definition(t) {
            for (const [name, configFactory] of Object.entries(queries)) {
                const config = configFactory(context);
                t.field(name, config);
            }
        },
    });
};
exports.getQueries = getQueries;
