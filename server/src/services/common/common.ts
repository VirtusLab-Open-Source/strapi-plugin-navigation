import type { Core, UID } from '@strapi/strapi';

import { sanitize } from '@strapi/utils';

import slugify from '@sindresorhus/slugify';

import { omit } from 'lodash';

import { configSetup } from '../../config';
import { CreateBranchNavigationItemDTO, NavigationItemDTO } from '../../dtos';
import { getGenericRepository, getNavigationItemRepository } from '../../repositories';
import {
  DynamicSchemas,
  NavigationItemCustomField,
  NavigationItemDBSchema,
  NavigationItemsDBSchema,
  NavigationPluginConfigDBSchema,
  updateConfigSchema,
  updateCreateNavigationSchema,
  updateNavigationItemAdditionalField,
  updateNavigationItemCustomField,
  updateUpdateNavigationSchema,
} from '../../schemas';
import {
  ContentType,
  NavigationAction,
  NavigationActionsCategories,
  NavigationActionsPerItem,
} from '../../types';
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
import { checkDuplicatePath, DuplicateCheckItem, generateFieldsFromRelated } from './utils';
import { getPluginService } from '../../utils';

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
    locale,
    master,
    navigationItems,
    parent,
    populate,
    status = 'published',
  }: MapToNavigationItemDTOInput): Promise<NavigationItemDTO[]> {
    const result: NavigationItemDTO[] = [];

    const pluginStore = await this.getPluginStore();
    const config = await pluginStore
      .get({
        key: 'config',
      })
      .then(DynamicSchemas.configSchema.parse);

    const extendedNavigationItems = await Promise.all(
      navigationItems.map(async (item) => {
        if (!item.related?.__type || !item.related.documentId) {
          return item;
        }

        const fieldsToPopulate = config.contentTypesPopulate[item.related.__type];

        const repository = getGenericRepository({ strapi }, item.related.__type as UID.ContentType);

        const related = await repository.findById(
          item.related.documentId,
          fieldsToPopulate,
          status,
          {
            locale,
          }
        );

        return {
          ...item,
          related: {
            ...related,
            __type: item.related.__type,
            documentId: item.related.documentId,
          },
        };
      })
    );

    for (const navigationItem of extendedNavigationItems) {
      const { items = [], ...base } = navigationItem;

      result.push({
        ...base,
        parent: parent ?? base.parent,
        items: await this.mapToNavigationItemDTO({
          navigationItems: items,
          populate,
          master,
          parent: base as NavigationItemDTO,
          locale,
          status,
        }),
      } as NavigationItemDTO);
    }

    return result;
  },

  setDefaultConfig(): Promise<NavigationPluginConfigDBSchema> {
    return configSetup({ strapi, forceDefault: true });
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
      if (!navigationItem.documentId) {
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

    const adminService = getPluginService(context, 'admin');
    const { contentTypesNameFields, pathDefaultFields } = await adminService.config({
      viaSettingsPage: false,
    });

    for (const navigationItem of navigationItems) {
      action.create = true;

      const { parent, master, items, documentId, id, related, autoSync, ...params } = navigationItem;

      const { title = params.title, path = params.path } = autoSync ? await generateFieldsFromRelated(
        context,
        related,
        masterEntity?.locale || 'en',
        contentTypesNameFields,
        pathDefaultFields,
      ) : {};

      const insertDetails =
        documentId && id
          ? {
              ...params,
              documentId,
              id,
              master: masterEntity ? masterEntity.id : undefined,
              parent: parentItem ? parentItem.id : undefined,
              autoSync,
              title,
              path,
              related,
            }
          : {
              ...params,
              documentId: undefined,
              id: undefined,
              master: masterEntity ? masterEntity.id : undefined,
              parent: parentItem ? parentItem.id : undefined,
              autoSync,
              title,
              path,
              related,
            };

      const nextParentItem = await getNavigationItemRepository(context).save({
        item: insertDetails as any,
        locale: masterEntity?.locale,
      });

      if (!!navigationItem.items?.length) {
        const innerActions = await this.createBranch({
          action: {},
          masterEntity,
          navigationItems: navigationItem.items,
          parentItem: nextParentItem as NavigationItemDBSchema,
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

      const { documentId, updated, parent, master, items, ...params } = updateDetails;

      let currentItem;

      if (updated) {
        currentItem = await getNavigationItemRepository(context).save({
          item: {
            documentId,
            ...params,
          },
          locale: masterEntity?.locale,
        });
      } else {
        currentItem = updateDetails;
      }

      if (!!items?.length) {
        const innerResult = await this.analyzeBranch({
          navigationItems: items,
          prevAction: {},
          masterEntity,
          parentItem: currentItem as NavigationItemDBSchema,
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
      filters: {
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
        item: {
          documentId: item.documentId,
          additionalFields: item.additionalFields,
        },
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

  updateConfigSchema,
  updateCreateNavigationSchema,
  updateNavigationItemAdditionalField,
  updateNavigationItemCustomField,
  updateUpdateNavigationSchema,
});

export default commonService;
