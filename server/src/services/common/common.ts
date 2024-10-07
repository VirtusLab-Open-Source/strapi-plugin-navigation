import type { Core, UID } from '@strapi/strapi';

import { sanitize } from '@strapi/utils';

import slugify from '@sindresorhus/slugify';

import { AnyEntity } from '@sensinum/strapi-utils';

import { isNil, omit } from 'lodash';

import { configSetup } from '../../config';
import { CreateBranchNavigationItemDTO, NavigationItemDTO } from '../../dtos';
import { getGenericRepository, getNavigationItemRepository } from '../../repositories';
import {
  NavigationItemCustomField,
  NavigationItemDBSchema,
  NavigationItemsDBSchema,
  NavigationPluginConfigDBSchema,
  configSchema,
} from '../../schemas';
import {
  ContentType,
  NavigationAction,
  NavigationActionsCategories,
  NavigationActionsPerItem,
} from '../../types';
import { RELATED_ITEM_SEPARATOR, parsePopulateQuery } from '../../utils';
import {
  AnalyzeBranchInput,
  BuildNestedStructureInput,
  CreateBranchInput,
  EmitEventInput,
  GetBranchNameInput,
  GetSlugInput,
  LifecycleHookRecord,
  MapToNavigationItemDTOInput,
  RegisterLifeCycleHookInput,
  RemoveBranchInput,
  RunLifeCycleHookInput,
  UpdateBranchInput,
} from './types';
import { DuplicateCheckItem, checkDuplicatePath } from './utils';

export type CommonService = ReturnType<typeof commonService>;

const lifecycleHookListeners: Record<ContentType, LifecycleHookRecord> = {
  navigation: {},
  'navigation-item': {},
};

const commonService = (context: { strapi: Core.Strapi }) => ({
  async getPluginStore(): Promise<ReturnType<typeof strapi.store>> {
    return await strapi.store({ type: 'plugin', name: 'navigation' });
  },

  async mapToNavigationItemDTO({
    navigationItems,
    populate,
    master,
    parent,
  }: MapToNavigationItemDTOInput): Promise<NavigationItemDTO[]> {
    const entities: Map<string, NavigationItemDTO['related']> = new Map();
    const result: NavigationItemDTO[] = [];

    const pluginStore = await this.getPluginStore();
    const config = configSchema.parse(await pluginStore.get({ key: 'config' }));

    for (const navigationItem of navigationItems) {
      const { related, items = [], master: _, parent: __, ...base } = navigationItem;

      if (!related) {
        result.push({
          ...base,
          items: [] as NavigationItemDTO[],
          related: undefined,
          master,
          parent,
        });
      }

      if (related && !entities.has(related)) {
        const [uid, documentId] = related.split(RELATED_ITEM_SEPARATOR);

        const relatedItem = await getGenericRepository(context, uid as UID.ContentType).findById(
          documentId,
          isNil(populate) ? config.contentTypesPopulate[uid] || [] : parsePopulateQuery(populate)
        );

        entities.set(related, {
          ...relatedItem as AnyEntity, 
          uid,
        });
      }

      const preItem = {
        ...base,
        related: related ? entities.get(related) : undefined,
        master,
        parent,
        items: [],
      };

      result.push({
        ...preItem,
        items: await this.mapToNavigationItemDTO({
          navigationItems: items,
          populate,
          master,
          parent: preItem,
        }),
      });
    }

    return result;
  },

  setDefaultConfig(): Promise<NavigationPluginConfigDBSchema> {
    return configSetup({ strapi });
  },

  getBranchName({ item }: GetBranchNameInput): NavigationActionsCategories | void {
    const hasId = !!item.documentId;
    const toRemove = item.removed;

    if (hasId && !toRemove) {
      return 'toUpdate';
    }

    if (hasId && toRemove) {
      return 'toRemove';
    }

    if (!hasId && !toRemove) {
      return 'toCreate';
    }
  },

  async analyzeBranch({
    masterEntity,
    navigationItems = [],
    parentItem,
    prevAction = {},
  }: AnalyzeBranchInput): Promise<NavigationAction[]> {
    const { toCreate, toRemove, toUpdate } = navigationItems.reduce(
      (acc, navigationItem) => {
        const branchName: keyof NavigationActionsPerItem | void = this.getBranchName({
          item: navigationItem,
        });

        return branchName ? { ...acc, [branchName]: [...acc[branchName], navigationItem] } : acc;
      },
      {
        toRemove: [] as NavigationItemsDBSchema,
        toCreate: [] as CreateBranchNavigationItemDTO[],
        toUpdate: [] as NavigationItemsDBSchema,
      }
    );

    console.log({ toCreate, toRemove, toUpdate });

    const action = {
      create: prevAction.create || toCreate.length > 0,
      update: prevAction.update || toUpdate.length > 0,
      remove: prevAction.remove || toRemove.length > 0,
    };

    const checkData: DuplicateCheckItem[] = [...toCreate, ...toUpdate];

    await checkDuplicatePath({
      checkData,
      parentItem,
    });

    return Promise.all([
      this.createBranch({
        action,
        masterEntity,
        navigationItems: toCreate,
        parentItem,
      }),
      this.removeBranch({
        navigationItems: toRemove,
        action,
      }),
      this.updateBranch({
        action,
        masterEntity,
        navigationItems: toUpdate,
        parentItem,
      }),
    ]).then(([a, b, c]) => [...a, ...b, ...c]);
  },

  async removeBranch({
    navigationItems = [],
    action = {},
  }: RemoveBranchInput): Promise<NavigationAction[]> {
    const navigationActions: NavigationAction[] = [];

    for (const navigationItem of navigationItems) {
      if (!navigationItem.id) {
        continue;
      }
      action.remove = true;

      await getNavigationItemRepository(context).remove(navigationItem);

      navigationActions.push(action);

      if (!!navigationItem.items?.length) {
        const innerResult = await this.removeBranch({
          navigationItems: navigationItem.items,
        });

        innerResult.forEach((_) => {
          navigationActions.push(_);
        });
      }
    }

    return navigationActions;
  },

  async createBranch({
    action,
    masterEntity,
    navigationItems,
    parentItem,
  }: CreateBranchInput): Promise<NavigationAction[]> {
    let navigationActions: NavigationAction[] = [];

    for (const navigationItem of navigationItems) {
      action.create = true;

      const { parent, master, items, id, ...params } = navigationItem;

      const insertDetails = id
        ? {
            ...params,
            id,
            master: masterEntity ? masterEntity.id : undefined,
            parent: parentItem ? parentItem.id : undefined,
          }
        : {
            ...params,
            id: undefined,
            master: masterEntity ? masterEntity.id : undefined,
            parent: parentItem ? parentItem.id : undefined,
          };

      const nextParentItem = await getNavigationItemRepository(context).save(insertDetails as any);

      if (!!navigationItem.items?.length) {
        const innerActions = await this.createBranch({
          action: {},
          masterEntity,
          navigationItems: navigationItem.items,
          parentItem: nextParentItem,
        });

        navigationActions = navigationActions.concat(innerActions).concat([action]);
      } else {
        navigationActions.push(action);
      }
    }

    return navigationActions;
  },

  async updateBranch({
    masterEntity,
    navigationItems,
    action,
    parentItem,
  }: UpdateBranchInput): Promise<NavigationAction[]> {
    const result: NavigationAction[] = [];

    for (const updateDetails of navigationItems) {
      action.update = true;

      const { id, updated, parent, master, items, ...params } = updateDetails;

      let currentItem;

      if (updated) {
        currentItem = await getNavigationItemRepository(context).save({
          id,
          ...params,
        });
      } else {
        currentItem = updateDetails;
      }

      if (!!items?.length) {
        const innerResult = await this.analyzeBranch({
          navigationItems: items,
          prevAction: {},
          masterEntity,
          parentItem: currentItem,
        });

        innerResult.forEach((_) => {
          result.push(_);
        });
      } else {
        result.push(action);
      }
    }

    return result;
  },

  async emitEvent({ entity, event, uid }: EmitEventInput<any, any>) {
    // TODO: This could be enhanced by reacting not only with webhook but by firing all listeners in Navigation Event Hub
    // Any developer could register new listener for any event in Navigation Plugin
    // For now there is only one event 'navigation.update' so implementing Event hub is not valid.
    const model: any = strapi.getModel(uid);
    const sanitizedEntity = await sanitize.sanitizers.defaultSanitizeOutput(
      {
        ...model,
        schema: model.__schema__,
        getModel: () => model,
      },
      entity
    );

    if ((strapi as any).webhookRunner) {
      (strapi as any).webhookRunner.eventHub.emit(event, {
        model: model.modelName,
        entry: sanitizedEntity,
      });
    } else {
      console.warn('Webhook runner not present. Contact with Strapi Navigation Plugin team.');
    }
  },

  async pruneCustomFields({ removedFields }: { removedFields: NavigationItemCustomField[] }) {
    const removedFieldsKeys = removedFields.map(({ name }) => `additionalFields.${name}`);
    const removedFieldsNames = removedFields.map(({ name }) => name);

    const navigationItems = await getNavigationItemRepository(context).find({
      where: {
        additionalFields: {
          $contains: [removedFieldsNames],
        },
      },
    });

    const navigationItemsToUpdate = navigationItems.map(
      (navigationItem) =>
        omit(navigationItem, removedFieldsKeys) as unknown as NavigationItemDBSchema
    );

    for (const item of navigationItemsToUpdate) {
      await getNavigationItemRepository(context).save({
        documentId: item.documentId,
        additionalFields: item.additionalFields,
      });
    }
  },

  async getSlug({ query }: GetSlugInput) {
    let slug = slugify(query);

    if (slug) {
      const existingItems = await getNavigationItemRepository(context).count({
        $or: [
          {
            uiRouterKey: {
              $startsWith: slug,
            },
          },
          { uiRouterKey: slug },
        ],
      });

      if (existingItems) {
        slug = `${slug}-${existingItems}`;
      }
    }

    return slug.toLowerCase();
  },

  registerLifeCycleHook({ callback, contentTypeName, hookName }: RegisterLifeCycleHookInput) {
    if (!lifecycleHookListeners[contentTypeName][hookName]) {
      lifecycleHookListeners[contentTypeName][hookName] = [];
    }

    lifecycleHookListeners[contentTypeName][hookName]?.push(callback);
  },

  async runLifeCycleHook({ contentTypeName, event, hookName }: RunLifeCycleHookInput) {
    const hookListeners = lifecycleHookListeners[contentTypeName][hookName] ?? [];

    for (const listener of hookListeners) {
      await listener(event);
    }
  },

  buildNestedStructure({
    navigationItems,
    id,
  }: BuildNestedStructureInput): NavigationItemDBSchema[] {
    return (
      navigationItems?.reduce((acc, navigationItem) => {
        if (id && navigationItem.parent?.id !== id) {
          return acc;
        }

        acc.push({
          ...omit(navigationItem, ['related', 'items']),
          related: navigationItem.related,
          items: this.buildNestedStructure({
            navigationItems,
            id: navigationItem.id,
          }),
        });

        return acc;
      }, [] as NavigationItemDBSchema[]) ?? []
    );
  },

  async readLocale() {
    const localeService = strapi.plugin('i18n').service('locales');

    let defaultLocale: string = await localeService.getDefaultLocale();
    let restLocale: string[] = (await localeService.find({}))
      .map(({ code }: { code: string }) => code)
      .filter((code: string) => code !== defaultLocale);

    if (!defaultLocale) {
      defaultLocale = restLocale[0];
      restLocale = restLocale.slice(1);
    }

    return {
      defaultLocale,
      restLocale,
    };
  },
});

export default commonService;
