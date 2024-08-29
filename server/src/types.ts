import { NavigationItemDBSchema } from './schemas';

export type PluginConfigNameFields = Record<string, string[]>;
export type PluginConfigPopulate = Record<string, string[]>;
export type PluginConfigPathDefaultFields = Record<string, string[]>;

export type NavigationItemCustomFieldType = 'boolean' | 'string' | 'select' | 'media';
export type NavigationItemAdditionalFieldValues = Record<string, string | boolean | string[]>;

export type PluginConfigGraphQL = {
  navigationItemRelated: string[];
};

export type ContentType = 'navigation' | 'navigation-item';

export type LifeCycleHookName =
  | 'beforeCreate'
  | 'beforeCreateMany'
  | 'afterCreate'
  | 'afterCreateMany'
  | 'beforeUpdate'
  | 'beforeUpdateMany'
  | 'afterUpdate'
  | 'afterUpdateMany'
  | 'beforeDelete'
  | 'beforeDeleteMany'
  | 'afterDelete'
  | 'afterDeleteMany'
  | 'beforeCount'
  | 'afterCount'
  | 'beforeFindOne'
  | 'afterFindOne'
  | 'beforeFindMany'
  | 'afterFindMany';

export interface LifeCycleEvent<
  THookName extends LifeCycleHookName = LifeCycleHookName,
  TResult = unknown,
  TParams = Record<string, unknown>,
> {
  action: THookName;
  model: {
    singularName: string;
    uid: string;
    tableName: string;
    attributes: Record<string, unknown>;
    lifecycles: Partial<Record<LifeCycleHookName, Effect<LifeCycleEvent>>>;
    indexes: Array<{
      type?: string;
      name: string;
      columns: string[];
    }>;
    columnToAttribute: Record<string, string>;
  };
  state: Record<string, unknown>;
  params: TParams;
  result?: TResult | TResult[];
}

export type Effect<T> = (value: T) => void;
export type VoidEffect = Effect<void>;

export type StrapiContentTypeFullSchema<TAttributes extends string = string> = any;

export type NavigationAction = {
  create?: boolean;
  update?: boolean;
  remove?: boolean;
};

export type NavigationActionsCategories = 'toCreate' | 'toUpdate' | 'toRemove';

export type NavigationActionsPerItem = Record<NavigationActionsCategories, NavigationItemDBSchema>;
