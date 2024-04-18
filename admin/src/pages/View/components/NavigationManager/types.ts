import { Dispatch, SetStateAction } from "react";
import { Navigation as FullNavigationEntity } from "../../../../../../types";

export type Navigation = Pick<
  FullNavigationEntity,
  "id" | "items" | "name" | "localeCode" | "localizations" | "visible"
>;

export type State =
  | InitialState
  | ListState
  | EditState
  | CreateState
  | DeleteState
  | PurgeCacheState
  | ErrorState;

export type SetState = Dispatch<SetStateAction<State>>;

interface CommonState {
  isLoading?: boolean;
}

export interface CommonProps {
  setState: SetState;
}

export interface InitialState extends CommonState {
  view: "INITIAL";
}

export interface ListState extends CommonState {
  view: "LIST";
  navigations: Array<Navigation>;
  selected: Array<Navigation>;
}

export interface EditState extends CommonState {
  view: "EDIT";
  navigation: Navigation;
  current?: Navigation;
  alreadyUsedNames: Array<string>;
}

export interface CreateState extends CommonState {
  view: "CREATE";
  current: Navigation;
  alreadyUsedNames: Array<string>;
}

export interface DeleteState extends CommonState {
  view: "DELETE";
  navigations: Array<Navigation>;
}

export interface PurgeCacheState extends CommonState {
  view: "CACHE_PURGE";
  navigations: Array<Navigation>;
}

export interface ErrorState extends CommonState {
  view: "ERROR";
  errors: Array<Error>;
}
