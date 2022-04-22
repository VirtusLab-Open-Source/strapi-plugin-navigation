import { request } from '@strapi/helper-plugin';
import pluginId from '../pluginId';

export const fetchNavigationConfig = async (toggleNotification) => {
  try {
    const data = await request(`/${pluginId}/settings/config`, { method: 'GET' });
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
  request(`/${pluginId}/config`, { method: 'PUT', body }, true);

export const restoreNavigationConfig = async () =>
  request(`/${pluginId}/config`, { method: 'DELETE' }, true);

export const fetchAllContentTypes = async (toggleNotification) => {
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

export const restartStrapi = async (toggleNotification) => {
  try {
    const { data } = await request(`/${pluginId}/settings/restart`);

    return data;
  } catch (err) {
    toggleNotification({
      type: 'warning',
      message: { id: 'notification.error' },
    });

    return { err };
  }
};
