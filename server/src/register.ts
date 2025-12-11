import type { Core } from '@strapi/types';
import middlewares from './middlewares';

const register = ({ strapi }: { strapi: Core.Strapi }) => {
  strapi.server.use(middlewares.localeMiddleware({ strapi }));
};
export default register;
