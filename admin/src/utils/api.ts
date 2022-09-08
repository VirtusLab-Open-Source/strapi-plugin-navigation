// @ts-ignore
import { request } from '@strapi/helper-plugin';
import pluginId from '../pluginId';

export const restartStrapi = () =>
  request(`/${pluginId}/settings/restart`);
