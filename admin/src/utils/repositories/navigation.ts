// @ts-ignore
import { request } from '@strapi/helper-plugin';
import pluginId from '../../pluginId';
import { QueryFunctionContext } from 'react-query'
import { Id } from 'strapi-typed';
import { isNil } from 'lodash';
import { Navigation } from '../../../../types';
const navigationsQueryIndex = "getNavigations";

interface INavigationRepository {
  getIndex: () => string,
  fetch: () => Promise<Navigation[]>,
  fetchOne: (ctx: QueryFunctionContext<[string, Id | null]>) => Promise<Navigation | null>
}

export const NavigationsRepository: INavigationRepository = {
  getIndex: () => navigationsQueryIndex,
  fetch: () => request(`/${pluginId}`),
  fetchOne: ({ queryKey }: QueryFunctionContext<[string, Id | null]>) => isNil(queryKey[1]) ? null : request(`/${pluginId}/${queryKey[1]}`),
}