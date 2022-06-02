import { sortBy } from "lodash";
// @ts-ignore
import { Flex } from "@strapi/design-system/Flex";
// @ts-ignore
import { Loader } from "@strapi/design-system/Loader";
import {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalLayout,
  // @ts-ignore
} from "@strapi/design-system/ModalLayout";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import useDataManager from "../../../../hooks/useDataManager";
import { getMessage } from "../../../../utils";
import { Create, createFooterActions } from "./Create";
import { Delete, deleteFooterActions } from "./Delete";
import { Edit, editFooterActions } from "./Edit";
import { errorFooterActions, ErrorView } from "./Error";
import { List, listFooterActions } from "./List";
import { FooterActionsFactory, SetState, State } from "./types";

interface Props {
  initialState: State;
  onClose?: () => void;
  isOpened?: boolean;
}

export const NavigationManager = ({
  initialState,
  onClose,
  isOpened,
}: Props) => {
  const { formatMessage } = useIntl();
  const [state, setState] = useState(initialState);
  const {
    items = [],
    handleNavigationsDeletion,
    handleSubmitNavigation,
    hardReset,
  } = useDataManager();
  const navigations = useMemo(() => sortBy(items, "id"), [items]);
  const onReset = useCallback(() => setState({ view: "INITIAL" }), [setState]);
  const onSubmit = useCallback(async () => {
    const performAction =
      state.view === "DELETE"
        ? async () => {
            await handleNavigationsDeletion(
              state.navigations.map(({ id }) => id)
            );
            await hardReset();
          }
        : (state.view === "CREATE" || state.view === "EDIT") && state.current
        ? async () => {
            await handleSubmitNavigation(formatMessage, state.current);
            await hardReset();
          }
        : () => {};

    try {
      setState({
        ...state,
        isLoading: true,
      });
      await performAction();
      setState({ view: "INITIAL" });
    } catch (error) {
      setState({
        view: "ERROR",
        errors: error instanceof Error ? [error] : [],
      });
    }
  }, [
    state,
    setState,
    hardReset,
    handleSubmitNavigation,
    handleNavigationsDeletion,
  ]);

  useEffect(() => {
    if (state.view === "INITIAL") {
      setState({
        view: "LIST",
        navigations,
        selected: [],
      });
    }
  }, [state.view]);

  const header = renderHeader(state);
  const content = renderContent(state, setState);
  const footerProps = renderFooterProps({
    state,
    setState,
    onClose,
    onSubmit,
    onReset,
    navigations,
  });

  return (
    <ModalLayout
      labelledBy="condition-modal-breadcrumbs"
      onClose={onClose}
      isOpen={isOpened}
    >
      <ModalHeader>{header}</ModalHeader>
      <ModalBody>{content}</ModalBody>
      <ModalFooter {...footerProps} />
    </ModalLayout>
  );
};

export const useNavigationManager = () => {
  const [isOpened, setIsOpened] = useState(false);
  const open = useCallback(() => setIsOpened(true), [setIsOpened]);
  const close = useCallback(() => setIsOpened(false), [setIsOpened]);

  const modal = useMemo(
    () =>
      isOpened ? (
        <NavigationManager
          initialState={{ view: "INITIAL" }}
          isOpened
          onClose={close}
        />
      ) : null,
    [isOpened, close]
  );

  return useMemo(
    () => ({
      navigationManagerModal: modal,
      openNavigationManagerModal: open,
      closeNavigationManagerModal: close,
    }),
    [modal, open, close]
  );
};

const renderHeader = (state: State) => {
  switch (state.view) {
    case "LIST":
    case "CREATE":
    case "ERROR":
    case "DELETE": {
      return (
        <Flex direction="row">
          {state.isLoading ? <Loader small /> : null}
          {getMessage(`popup.navigation.manage.header.${state.view}`)}
        </Flex>
      );
    }
    case "EDIT": {
      return (
        <Flex direction="row">
          {state.isLoading ? <Loader small /> : null}
          {getMessage({
            id: "popup.navigation.manage.header.EDIT",
            props: {
              name: state.navigation.name,
            },
          })}
        </Flex>
      );
    }
    case "INITIAL": {
      return null;
    }
    default:
      return handleUnknownState(state);
  }
};

const renderContent = (state: State, setState: SetState) => {
  const commonProps = {
    setState,
  };

  switch (state.view) {
    case "LIST": {
      return <List {...state} {...commonProps} />;
    }
    case "EDIT": {
      return <Edit {...state} {...commonProps} />;
    }
    case "CREATE": {
      return <Create {...state} {...commonProps} />;
    }
    case "DELETE": {
      return <Delete {...state} {...commonProps} />;
    }
    case "INITIAL": {
      return <Loader small />;
    }
    case "ERROR": {
      return <ErrorView {...state} {...commonProps} />;
    }
    default:
      return handleUnknownState(state);
  }
};

const renderFooterProps: FooterActionsFactory = (props) => {
  switch (props.state.view) {
    case "LIST": {
      return listFooterActions(props);
    }
    case "CREATE": {
      return createFooterActions(props);
    }
    case "EDIT": {
      return editFooterActions(props);
    }
    case "DELETE": {
      return deleteFooterActions(props);
    }
    case "ERROR": {
      return errorFooterActions(props);
    }
    case "INITIAL": {
      return null;
    }
    default:
      return handleUnknownState(props.state);
  }
};

const handleUnknownState = (state: any) => {
  console.warn(`Unknown state "${state?.view}". (${JSON.stringify(state)})`);
  return null;
};
