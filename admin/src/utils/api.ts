// @ts-ignore
import { request } from '@strapi/helper-plugin';
import { prop } from 'lodash/fp';
import pluginId from '../pluginId';

export const fetchAllContentTypes = async () =>
  request('/content-manager/content-types', { method: 'GET' }).then(prop("data"));

export const restartStrapi = () =>
  request(`/${pluginId}/settings/restart`);
