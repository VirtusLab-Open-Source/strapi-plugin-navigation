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

export const filterByPath = <T extends Pick<NavigationItemDTO, 'parent' | 'id' | 'path'>>(
  items: T[],
  path?: string
): { root?: NestedPath; items: T[] } => {
  const itemsWithPaths = path
    ? buildNestedPaths(items).filter(({ path: itemPath }) => itemPath.includes(path))
    : [];
  const root = itemsWithPaths.find(({ path: itemPath }) => itemPath === path);

  return {
    root,
    items: isNil(root) ? [] : items.filter(({ id }) => itemsWithPaths.find((v) => v.id === id)),
  };
};

export const buildNestedPaths = <T extends Pick<NavigationItemDTO, 'parent' | 'id' | 'path'>>(
  items: T[],
  id?: number,
  parentPath: string | null = null
): NestedPath[] => {
  return items
    .filter((entity) => {
      let data: NavigationItemDTO | undefined | null = entity.parent;

      if (!data == null && !id) {
        return true;
      }

      return entity.parent?.id === id;
    })
    .reduce<NestedPath[]>((acc, entity): NestedPath[] => {
      const path = `${parentPath || ''}/${entity.path}`.replace('//', '/');

      return [
        {
          id: entity.id,
          parent: parentPath && entity.parent?.id
            ? {
                id: entity.parent?.id,
                path: parentPath,
              }
            : undefined,
          path,
        },
        ...buildNestedPaths(items, entity.id, path),
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
