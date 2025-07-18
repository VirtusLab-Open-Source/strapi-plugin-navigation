"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asProxy = void 0;
const ignoredProps = new Set(['asymmetricMatch']);
const asProxy = (base) => new Proxy(base, {
    get(target, property) {
        if (typeof property === 'string' &&
            target[property] === undefined &&
            !ignoredProps.has(property)) {
            console.warn(`Property "${property}" unavailable at ${JSON.stringify(target)}`);
        }
        return target[property];
    },
});
exports.asProxy = asProxy;
