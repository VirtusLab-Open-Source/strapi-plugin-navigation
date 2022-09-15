import { useCallback, useMemo, useState } from "react";

// @ts-ignore
import { request } from "@strapi/helper-plugin";
import { find, get } from "lodash";
import useConfig from "./useConfig";
import { ResourceState } from "../utils";
import { ContentTypeEntity, Effect } from "../../../types";

const CONTENT_TYPE_ITEMS_URL_BASE = "/navigation/content-type-items/";

interface IUseContentTypeItems {
  getContentTypeItems: Effect<{ modelUID: string, query: string, locale: string }>;
  contentTypeItems: ContentTypeEntity[];
}

export const useContentTypeItems = (): ResourceState<IUseContentTypeItems, Error> => {
  const [contentTypeItems, setContentTypeItems] = useState<ContentTypeEntity[]>([]);
  const abortController = useMemo(() => new AbortController(), []);
  const config = useConfig();

  const getContentTypeItems = useCallback(async ({ modelUID, query, locale }: { modelUID: string, query: string, locale: string }) => {
    if (config.state !== ResourceState.RESOLVED) {
      return;
    }

    const url = `${CONTENT_TYPE_ITEMS_URL_BASE}${modelUID}`;
    const queryParams = new URLSearchParams();
    queryParams.append('_publicationState', 'preview');
    if (query) {
      queryParams.append('_q', query);
    }
    if (locale) {
      queryParams.append('localeCode', locale);
    }

    const contentTypeItems = await request(`${url}?${queryParams.toString()}`, {
      method: "GET",
      signal: abortController.signal,
    });

    const fetchedContentType = find(config.value.contentTypes, ct => ct.uid === modelUID);
    const isArray = Array.isArray(contentTypeItems);
    
    setContentTypeItems(isArray ? contentTypeItems : [contentTypeItems].map(item => ({
      ...item,
      __collectionUid: get(fetchedContentType, 'collectionUid', modelUID),
    })));
  }, []);

  if (config.state !== ResourceState.RESOLVED) {
    return config;
  }

  return {
    state: ResourceState.RESOLVED,
    value: {
      getContentTypeItems,
      contentTypeItems,
    }
  };
} 