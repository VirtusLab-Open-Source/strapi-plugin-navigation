import { find, get, isArray, isEmpty, isNil, isString, last, zipWith } from 'lodash';
import { NavigationItemDTO } from '../../dtos';
import { StrapiContentTypeFullSchema } from '../../types';
import { NestedPath } from './types';

export const composeItemTitle = (
  item: NavigationItemDTO,
  fields: Record<string, string[]> = {},
  contentTypes: StrapiContentTypeFullSchema[] = []
): string | undefined => {
  const { title, related } = item;
  const lastRelated = isArray(related) ? last(related) : related;

  if (title) {
    return isString(title) && !isEmpty(title) ? title : undefined;
  } else if (lastRelated) {
    const relationTitle = extractItemRelationTitle(lastRelated, fields, contentTypes);
    return isString(relationTitle) && !isEmpty(relationTitle) ? relationTitle : undefined;
  }
  return undefined;
};

export const extractItemRelationTitle = (
  relatedItem: any,
  fields: Record<string, string[]> = {},
  contentTypes: StrapiContentTypeFullSchema[] = []
) => {
  const { __contentType } = relatedItem;
  const contentType = find(contentTypes, (_) => _.contentTypeName === __contentType);
  const { default: defaultFields = [] } = fields;

  return (
    get(fields, `${contentType ? contentType.collectionName : ''}`, defaultFields)
      .map((_) => relatedItem[_])
      .filter((_) => _)[0] || ''
  );
};

export const filterByPath = <T extends Pick<NavigationItemDTO, 'parent' | 'documentId' | 'path'>>(
  items: T[],
  path?: string
): { root?: NestedPath; items: T[] } => {
  const parsedItems = buildNestedPaths(items);
  const itemsWithPaths = path
    ? parsedItems.filter(({ path: itemPath }) => itemPath.includes(path))
    : parsedItems;
  console.log('itemsWithPaths', itemsWithPaths);
  const root = itemsWithPaths.find(({ path: itemPath }) => itemPath === path);

  return {
    root,
    items: isNil(root) ? [] : items.filter(({ documentId }) => itemsWithPaths.find((v) => v.documentId === documentId)),
  };
};

export const buildNestedPaths = <T extends Pick<NavigationItemDTO, 'parent' | 'documentId' | 'path'>>(
  items: T[],
  documentId?: string,
  parentPath: string | null = null
): NestedPath[] => {
  return items
    .filter((entity) => {
      let data: NavigationItemDTO | undefined | null = entity.parent;

      if (!data == null && !documentId) {
        return true;
      }

      return entity.parent?.documentId === documentId;
    })
    .reduce<NestedPath[]>((acc, entity): NestedPath[] => {
      const path = `${parentPath || ''}/${entity.path}`.replace('//', '/');

      return [
        {
          documentId: entity.documentId,
          parent: parentPath && entity.parent?.documentId
            ? {
                id: entity.parent?.id,
                documentId: entity.parent?.documentId,
                path: parentPath,
              }
            : undefined,
          path,
        },
        ...buildNestedPaths(items, entity.documentId, path),
        ...acc,
      ];
    }, []);
};

export const compareArraysOfNumbers = (arrA: number[], arrB: number[]) => {
  const diff = zipWith(arrA, arrB, (a, b) => {
    if (isNil(a)) return -1;
    if (isNil(b)) return 1;
    return a - b;
  });
  return find(diff, (a) => a !== 0) || 0;
};

export const filterOutUnpublished = (item: NavigationItemDTO) => {
  const relatedItem = item.related && (isArray(item.related) ? last(item.related) : item.related);

  const isHandledByPublishFlow = relatedItem ? 'publishedAt' in relatedItem : false;

  if (isHandledByPublishFlow) {
    const isRelatedDefinedAndPublished = relatedItem
      ? isHandledByPublishFlow && !!get(relatedItem, 'publishedAt')
      : false;

    return item.type === 'INTERNAL' ? isRelatedDefinedAndPublished : true;
  }

  return item.type !== 'INTERNAL' || relatedItem;
};
