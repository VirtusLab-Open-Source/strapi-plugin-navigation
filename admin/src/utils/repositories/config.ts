// @ts-ignore
import { request } from '@strapi/helper-plugin';
import { NavigationPluginConfig } from '../../../../types';
import pluginId from '../../pluginId';

export const getNavigationConfigQuery = "getNavigationConfigQuery"

export const getNavigationConfig = () =>
  request(`/${pluginId}/settings/config`);
export const updateNavigationConfig = (body: NavigationPluginConfig ) =>
  request(`/${pluginId}/config`, { method: 'PUT', body }, true);
export const restoreNavigationConfig = () =>
  request(`/${pluginId}/config`, { method: 'DELETE' }, true);