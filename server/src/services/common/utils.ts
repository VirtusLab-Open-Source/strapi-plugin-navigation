import { NavigationError } from '../../app-errors';
import { NavigationItemType } from '../../schemas';

export interface DuplicateCheckItem {
  items?: DuplicateCheckItem[];
  id?: number;
  title: string;
  path?: string | null;
  type: NavigationItemType;
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
          if (_.path === item.path && _.id !== item.id && item.type === 'INTERNAL') {
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
