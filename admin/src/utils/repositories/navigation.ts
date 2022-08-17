// @ts-ignore
import { request } from '@strapi/helper-plugin';
import pluginId from '../../pluginId';

export const getNavigationsQuery = "getNavigations";
export const getNavigations = () => request(`/${pluginId}`);