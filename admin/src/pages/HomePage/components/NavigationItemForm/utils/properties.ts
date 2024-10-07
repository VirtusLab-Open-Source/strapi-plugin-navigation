import { first, isEmpty } from 'lodash';

import {
  ConfigFromServerSchema,
  NavigationItemTypeSchema,
  StrapiContentTypeItemSchema,
} from '../../../../../api/validators';
import { extractRelatedItemLabel } from '../../../../HomePage/utils';
import { NavigationItemFormSchema } from './form';

interface GenerateUiRouterKeyInput {
  slugify: (s: string) => Promise<string>;
  title: string;
  related?: number | string;
  relatedType?: string;
  contentTypeItems?: Array<StrapiContentTypeItemSchema>;
  config?: ConfigFromServerSchema;
}

interface GeneratePreviewPathInput {
  isExternal?: boolean;
  currentPath?: string | null;
  current: Partial<NavigationItemFormSchema>;
  currentType: NavigationItemTypeSchema;
  currentRelatedType?: string;
  currentRelated?: number | string;
  config?: ConfigFromServerSchema;
  isSingleSelected?: boolean;
  contentTypeItems?: Array<StrapiContentTypeItemSchema>;
}

interface GetDefaultPathInput {
  currentType: NavigationItemTypeSchema;
  currentRelatedType?: string;
  currentRelated?: number | string;
  config?: ConfigFromServerSchema;
  isSingleSelected?: boolean;
  contentTypeItems?: Array<StrapiContentTypeItemSchema>;
}

export const generateUiRouterKey = async ({
  slugify,
  title,
  config,
  related,
  relatedType,
  contentTypeItems,
}: GenerateUiRouterKeyInput): Promise<string | undefined> => {
  if (title) {
    return title ? await slugify(title) : undefined;
  } else if (related) {
    const relationTitle = extractRelatedItemLabel(
      {
        ...(contentTypeItems?.find((_) => _.documentId === related.toString()) ?? {
          documentId: '',
          id: 0,
        }),
        __collectionUid: relatedType,
      },
      config
    );

    return relationTitle ? await slugify(relationTitle) : undefined;
  }

  return undefined;
};

export const getDefaultPath = ({
  currentType,
  config,
  contentTypeItems,
  currentRelated,
  currentRelatedType,
  isSingleSelected,
}: GetDefaultPathInput): string => {
  if (currentType !== 'INTERNAL') return '';

  if (!currentRelatedType) {
    return '';
  }

  const pathDefaultFields = config?.pathDefaultFields[currentRelatedType] ?? [];

  if (isEmpty(currentType) && !isEmpty(pathDefaultFields)) {
    const selectedEntity = isSingleSelected
      ? first(contentTypeItems ?? [])
      : contentTypeItems?.find(({ id }) => id === currentRelated);

    const pathDefaultValues = pathDefaultFields
      .map((field: string) => selectedEntity?.[field] ?? '')
      .filter((value: string) => !!value.toString().trim());

    return pathDefaultValues[0] ?? '';
  }

  return '';
};

export const generatePreviewPath = ({
  currentPath,
  isExternal,
  current,
  currentType,
  config,
  contentTypeItems,
  currentRelated,
  currentRelatedType,
  isSingleSelected,
}: GeneratePreviewPathInput): string | undefined => {
  if (!isExternal) {
    const itemPath =
      isEmpty(currentPath) || currentPath === '/'
        ? getDefaultPath({
            currentType,
            config,
            contentTypeItems,
            currentRelated,
            currentRelatedType,
            isSingleSelected,
          })
        : currentPath || '';

    const result = `${current.levelPath !== '/' ? `${current.levelPath}` : ''}/${itemPath}`;

    return result.replace('//', '/');
  }

  return undefined;
};
