"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphQLSetup = void 0;
const config_1 = __importDefault(require("./config"));
const graphQLSetup = async ({ strapi }) => {
    const hasGraphQLPlugin = !!strapi.plugin('graphql');
    if (hasGraphQLPlugin) {
        await (0, config_1.default)({ strapi });
    }
};
exports.graphQLSetup = graphQLSetup;
