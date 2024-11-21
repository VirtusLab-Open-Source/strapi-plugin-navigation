import { Core } from '@strapi/strapi';
import { CreateBranchNavigationItemDTO, NavigationItemDTO } from '../../dtos';
import { NavigationDBSchema, configSchema } from '../../schemas';
import { NavigationAction } from '../../types';

export type AuditLogContext = { emit: (e: string, d: AuditLogParams) => void };
export type AuditLogParams =
  | {
      actionType: string;
      oldEntity: NavigationDBSchema;
      newEntity: NavigationDBSchema;
    }
  | {
      actionType: 'DELETE';
      entity: NavigationDBSchema;
    };

export const sendAuditLog = (
  auditLogInstance: AuditLogContext,
  event: string,
  data: AuditLogParams
): void => {
  if (auditLogInstance && auditLogInstance.emit) {
    auditLogInstance.emit(event, data);
  }
};

export const prepareAuditLog = (actions: NavigationAction[]): string => {
  return [
    ...new Set(
      actions
        .filter((_: unknown) => !!_)
        .flatMap(({ remove, create, update }) => {
          return [create ? 'CREATE' : '', update ? 'UPDATE' : '', remove ? 'REMOVE' : ''].filter(
            (_) => !!_
          );
        })
    ),
  ].join('_');
};

type FillCopyContext = {
  master: NavigationDBSchema;
  strapi: Core.Strapi;
  locale: string;
  entities: Map<string, NavigationItemDTO['related']>;
};

export const processItems =
  (context: FillCopyContext) =>
  async (item: CreateBranchNavigationItemDTO): Promise<CreateBranchNavigationItemDTO> => {
    return {
      title: item.title,
      path: item.path,
      audience: item.audience,
      type: item.type,
      uiRouterKey: item.uiRouterKey,
      order: item.order,
      collapsed: item.collapsed,
      menuAttached: item.menuAttached,
      removed: false,
      updated: true,
      externalPath: item.externalPath,
      items: item.items
        ? await Promise.all(item.items.map(processItems(context)))
        : ([] as CreateBranchNavigationItemDTO[]),
      master: context.master,
      parent: undefined,
      related: item.related,
    };
  };

export const intercalate = <T, U extends T>(glue: T, arr: U[]) =>
  arr.slice(1).reduce<Array<T | U>>((acc, element) => acc.concat([glue, element]), arr.slice(0, 1));

export const getCacheStatus = async ({
  strapi,
}: {
  strapi: Core.Strapi;
}): Promise<{ hasCachePlugin: boolean; enabled: boolean }> => {
  const cachePlugin: null | any = strapi.plugin('rest-cache');
  const hasCachePlugin = !!cachePlugin;
  const pluginStore = strapi.store({
    type: 'plugin',
    name: 'navigation',
  });

  const config = configSchema.parse(
    await pluginStore.get({
      key: 'config',
    })
  );

  return hasCachePlugin
    ? { hasCachePlugin, enabled: !!config.isCacheEnabled }
    : { hasCachePlugin, enabled: false };
};
