import React from "react";
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
  | ErrorState;

export type SetState = React.Dispatch<React.SetStateAction<State>>;

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

export interface ErrorState extends CommonState {
  view: "ERROR";
  errors: Array<Error>;
}

export interface FooterActionsFactory {
  (props: {
    onSubmit: () => void;
    onClose: (() => void) | undefined;
    setState: SetState;
    state: State;
    onReset: () => void;
    navigations: Array<Navigation>;
  }): {
    startActions?: React.ReactElement;
    endActions?: React.ReactElement;
  } | null;
}
