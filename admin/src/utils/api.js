import { request } from '@strapi/helper-plugin';
import pluginId from '../pluginId';

export const fetchNavigationConfig = async () =>
  await request(`/${pluginId}/settings/config`, { method: 'GET' });

export const updateNavigationConfig = async ({ body }) =>
  await request(`/${pluginId}/config`, { method: 'PUT', body }, true);

export const restoreNavigationConfig = async () =>
  await request(`/${pluginId}/config`, { method: 'DELETE' }, true);

export const fetchAllContentTypes = async () => {
  const { data } = await request('/content-manager/content-types', { method: 'GET' });
  return { ...data }
}

export const restartStrapi = async () =>
  await request(`/${pluginId}/settings/restart`);
