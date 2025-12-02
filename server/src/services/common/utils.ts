import { getGenericRepository } from '../../repositories';
import { NavigationError } from '../../app-errors';
import { NavigationItemType } from '../../schemas';
import { Core, UID } from '@strapi/types';

export interface DuplicateCheckItem {
  items?: DuplicateCheckItem[];
  id?: number;
  title: string;
  path?: string | null;
  type: NavigationItemType;
  removed?: boolean;
}

export const checkDuplicatePath = ({
  checkData,
  parentItem,
}: {
  parentItem?: DuplicateCheckItem;
  checkData: DuplicateCheckItem[];
}): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (parentItem && parentItem.items) {
      for (let item of checkData) {
        for (let _ of parentItem.items) {
          if (_.path === item.path && _.id !== item.id && item.type === 'INTERNAL' && !_.removed) {
            return reject(
              new NavigationError(
                `Duplicate path:${item.path} in parent: ${parentItem.title || 'root'} for ${item.title} and ${_.title} items`,
                {
                  parentTitle: parentItem.title,
                  parentId: parentItem.id,
                  path: item.path,
                  errorTitles: [item.title, _.title],
                }
              )
            );
          }
        }
      }
    }

    return resolve();
  });
};

export const generateFieldsFromRelated = async (
  context: { strapi: Core.Strapi },
  related: any,
  locale: string,
  contentTypesNameFields: Record<string, string[]>,
  pathDefaultFields: Record<string, string[]>
) => {
  if (!related) {
    return {
      title: undefined,
      path: undefined,
    }
  }

  const relatedEntity = await getGenericRepository(context, related.__type as UID.ContentType).findById(
    related.documentId,
    undefined,
    'published',
    { locale } 
  );

  const defaultTitleFields = contentTypesNameFields[related.__type || 'default'];
  const title = defaultTitleFields.reduce((acc, field) => {
    return acc ? acc : relatedEntity?.[field]?.toString();
  }, '');

  const defaultPathFields = related ? pathDefaultFields[related.__type] : [];
  const path = defaultPathFields.reduce((acc, field) => {
    return acc ? acc : relatedEntity?.[field]?.toString();
  }, undefined) || relatedEntity?.id.toString();

  return { title, path }
}