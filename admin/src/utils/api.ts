// @ts-ignore
import { request } from '@strapi/helper-plugin';
import { NavigationPluginConfig } from '../../../types';
import pluginId from '../pluginId';

export const fetchNavigationConfig = () =>
  request(`/${pluginId}/settings/config`, { method: 'GET' });

export const updateNavigationConfig = ({ body }: { body: NavigationPluginConfig }) =>
  request(`/${pluginId}/config`, { method: 'PUT', body }, true);

export const restoreNavigationConfig = () =>
  request(`/${pluginId}/config`, { method: 'DELETE' }, true);

export const fetchAllContentTypes = async () => {
  const { data } = await request('/content-manager/content-types', { method: 'GET' });
  return data;
}

export const restartStrapi = () =>
  request(`/${pluginId}/settings/restart`);
