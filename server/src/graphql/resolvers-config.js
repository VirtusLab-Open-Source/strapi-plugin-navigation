"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResolversConfig = void 0;
const getResolversConfig = () => ({
    'Query.renderNavigationChild': { auth: false },
    'Query.renderNavigation': { auth: false },
});
exports.getResolversConfig = getResolversConfig;
