// @ts-ignore
import { request } from '@strapi/helper-plugin';
import { prop } from 'lodash/fp';

const allContentTypesQueryIndex = "getAllContentTypes";

export const AllContentTypesRepository = {
  getIndex: () => allContentTypesQueryIndex,
  fetch: () => request('/content-manager/content-types', { method: 'GET' }).then(prop("data")),
}
