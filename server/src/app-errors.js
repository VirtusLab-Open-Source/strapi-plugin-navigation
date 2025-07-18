"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidParamNavigationError = exports.FillNavigationError = exports.NavigationError = void 0;
class NavigationError extends Error {
    constructor(message, additionalInfo) {
        super(message);
        this.additionalInfo = additionalInfo;
        this.type = 'NavigationError';
    }
}
exports.NavigationError = NavigationError;
class FillNavigationError extends NavigationError {
    constructor() {
        super(...arguments);
        this.type = 'FillNavigationError';
    }
}
exports.FillNavigationError = FillNavigationError;
class InvalidParamNavigationError extends NavigationError {
    constructor() {
        super(...arguments);
        this.type = 'InvalidParamNavigationError';
    }
}
exports.InvalidParamNavigationError = InvalidParamNavigationError;
