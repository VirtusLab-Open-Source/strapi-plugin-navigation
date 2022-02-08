import { request } from '@strapi/helper-plugin';
import pluginId from '../pluginId';

export const fetchNavigationConfig = async () => {
  try {
    const data = await request(`/${pluginId}/config`, { method: 'GET' });
    return data;
  } catch (err) {
    toggleNotification({
      type: 'warning',
      message: { id: 'notification.error' },
    });

    return { err };
  }
}

export const updateNavigationConfig = async ({ body }) =>
  request(`/${pluginId}/config`, { method: 'PUT', body });

export const restoreNavigationConfig = async () =>
  request(`/${pluginId}/config`, { method: 'DELETE' });

export const fetchAllContentTypes = async () => {
  try {
    const { data } = await request('/content-manager/content-types');
    return { ...data }
  } catch (err) {
    toggleNotification({
      type: 'warning',
      message: { id: 'notification.error' },
    });

    return { err };
  }
}
