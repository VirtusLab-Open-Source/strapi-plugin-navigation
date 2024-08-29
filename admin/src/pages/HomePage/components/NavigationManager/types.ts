import { Dispatch, SetStateAction } from 'react';

import { NavigationSchema } from '../../../../api/validators';

export type Navigation = Pick<
  NavigationSchema,
  'id' | 'items' | 'name' | 'localeCode' | 'visible' | 'documentId' | 'slug'
>;

export type NewNavigation = Omit<Navigation, 'id' | 'documentId' | 'slug'>;

export type State =
  | InitialState
  | ListState
  | EditState
  | CreateState
  | DeleteState
  | PurgeCacheState
  | ErrorState;

export type SetState = Dispatch<SetStateAction<State>>;

interface CommonState {}

export interface CommonProps {
  setState: SetState;
  isLoading: boolean;
}

export interface InitialState extends CommonState {
  view: 'INITIAL';
}

export interface ListState extends CommonState {
  view: 'LIST';
  navigations: Array<Navigation>;
  selected: Array<Navigation>;
}

export interface EditState extends CommonState {
  view: 'EDIT';
  navigation: Navigation;
  current: Navigation;
  alreadyUsedNames: Array<string>;
}

export interface CreateState extends CommonState {
  view: 'CREATE';
  current: NewNavigation;
  alreadyUsedNames: Array<string>;
}

export interface DeleteState extends CommonState {
  view: 'DELETE';
  navigations: Array<Navigation>;
}

export interface PurgeCacheState extends CommonState {
  view: 'CACHE_PURGE';
  navigations: Array<Navigation>;
}

export interface ErrorState extends CommonState {
  view: 'ERROR';
  errors: Array<Error>;
}
