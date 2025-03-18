import { getFetchClient } from '@strapi/strapi/admin';
import { once } from 'lodash';
import { strapiContentTypeSchema } from '../schemas';
import {
  NavigationPluginConfigSchema,
  NavigationSchema,
  configFromServerSchema,
  i18nCopyItemDetails,
  localeSchema,
  navigationSchema,
  slugifyResult,
  strapiContentTypeItemSchema,
} from './validators';

const URL_PREFIX = 'navigation';

export type ApiClient = ReturnType<typeof getApiClient>;

export const getApiClient = once((fetch: ReturnType<typeof getFetchClient>) => ({
  getIndexPrefix() {
    return [URL_PREFIX];
  },

  readAll() {
    return fetch.get(`/${URL_PREFIX}`).then(({ data }) => navigationSchema.array().parse(data));
  },
  readAllIndex() {
    return [URL_PREFIX, 'navigations'];
  },

  delete(documentId: string) {
    return fetch.del(`/${URL_PREFIX}/${documentId}`);
  },

  create(body: Omit<NavigationSchema, 'documentId' | 'id' | 'slug'>) {
    return fetch.post(`/${URL_PREFIX}/`, body);
  },

  update(body: NavigationSchema) {
    return fetch.put(`/${URL_PREFIX}/${body.documentId}`, body);
  },

  purge({ documentId, withLangVersions }: { documentId?: string; withLangVersions?: boolean }) {
    return fetch.del(
      `/${URL_PREFIX}/cache/purge/${documentId ?? ''}?clearLocalisations=${!!withLangVersions}`
    );
  },

  slugify(query: string) {
    const queryParams = new URLSearchParams();

    queryParams.append('q', query);

    return fetch
      .get(`/${URL_PREFIX}/slug?${queryParams.toString()}`)
      .then(({ data }) => slugifyResult.parse(data))
      .then(({ slug }) => slug);
  },

  readConfig() {
    return fetch
      .get(`/${URL_PREFIX}/config`)
      .then(({ data }) => configFromServerSchema.parse(data));
  },
  readConfigIndex() {
    return [URL_PREFIX, 'config'];
  },

  healthCheck() {
    return fetch
      .get(`/_health`);
  },

  healthCheckIndex() {
    return ['health'];
  },

  readNavigationItemFromLocale({
    source,
    structureId,
    target,
    documentId,
  }: {
    source: string;
    target: string;
    documentId: string;
    structureId: string;
  }) {
    return fetch.get(
      `/${URL_PREFIX}/i18n/item/read/${documentId}/${source}/${target}?path=${structureId}`
    );
  },

  updateConfig(
    body: Omit<NavigationPluginConfigSchema, 'restrictedContentTypes' | 'allowedContentTypes'>
  ) {
    return fetch.put(`/${URL_PREFIX}/config`, body).then(() => {});
  },

  restart() {
    return fetch.get(`/${URL_PREFIX}/settings/restart`).then(() => {});
  },

  restoreConfig() {
    return fetch.del(`/${URL_PREFIX}/config`).then(() => {});
  },

  readSettingsConfig() {
    return fetch.get(`/${URL_PREFIX}/settings/config`).then(({ data }) => {
      const fromServer = configFromServerSchema.parse(data);

      return {
        ...fromServer,
        contentTypes: fromServer.contentTypes.map(({ uid }) => uid),
      };
    });
  },
  readSettingsConfigIndex() {
    return [URL_PREFIX, 'config'];
  },

  readContentType() {
    return fetch
      .get(`/content-manager/content-types`)
      .then(({ data }) => strapiContentTypeSchema.array().parse(data.data));
  },
  readContentTypeIndex() {
    return [URL_PREFIX, 'content-manager', 'content-types'];
  },

  readContentTypeItems({ uid, locale, query }: { uid: string; locale?: string; query?: string }) {
    const queryParams = new URLSearchParams();

    if (query) {
      queryParams.append('_q', query);
    }

    if (locale) {
      queryParams.append('locale', locale);
    }

    return fetch
      .get(`/${URL_PREFIX}/content-type-items/${uid}?${queryParams.toString()}`)
      .then(({ data }) => strapiContentTypeItemSchema.array().parse(data));
  },
  readContentTypeItemsIndex({
    uid,
    locale,
    query,
  }: {
    uid: string;
    locale?: string;
    query?: string;
  }) {
    return [URL_PREFIX, 'content-manager', 'content-type-items', uid, locale, query];
  },

  readLocale() {
    return fetch
      .get(`/${URL_PREFIX}/settings/locale`)
      .then((data) => localeSchema.parse(data.data));
  },
  readLocaleIndex() {
    return [URL_PREFIX, 'locale'];
  },

  copyNavigationLocale({
    documentId,
    source,
    target,
  }: {
    source: string;
    target: string;
    documentId: string;
  }) {
    return fetch.put(`/${URL_PREFIX}/i18n/copy/${documentId}/${source}/${target}`);
  },

  copyNavigationItemLocale({
    source,
    structureId = '',
    target,
  }: {
    source: string;
    target: string;
    structureId?: string;
  }) {
    return fetch
      .get(`/${URL_PREFIX}/i18n/item/read/${source}/${target}?path=${structureId}`)
      .then((data) => i18nCopyItemDetails.parse(data.data));
  },
}));
