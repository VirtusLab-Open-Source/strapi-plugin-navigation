// @ts-ignore
import { request } from '@strapi/helper-plugin';
import pluginId from '../../pluginId';
import { QueryFunctionContext } from 'react-query'
import { Id } from 'strapi-typed';
const navigationsQueryIndex = "getNavigations";

export const NavigationsRepository = {
  getIndex: () => navigationsQueryIndex,
  fetch: () => request(`/${pluginId}`),
  fetchOne: ({ queryKey }: QueryFunctionContext<[string, Id]>) => request(`/${pluginId}/${queryKey[1]}`),
}