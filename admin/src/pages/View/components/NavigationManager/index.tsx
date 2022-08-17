// @ts-ignore
import { Flex } from "@strapi/design-system/Flex";
// @ts-ignore
import { Loader } from "@strapi/design-system/Loader";
import {
  ModalBody,
  ModalHeader,
  ModalLayout,
  // @ts-ignore
} from "@strapi/design-system/ModalLayout";
import { sortBy } from "lodash";
import { prop } from "lodash/fp";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { VoidEffect } from "../../../../../../types";
import { useAvailableNavigations } from "../../../../hooks/useAvailableNavigations";
import useDataManager from "../../../../hooks/useDataManager";
import { getMessage } from "../../../../utils";
import { AllNavigations, AllNavigationsFooter } from "./AllNavigations";
import { DeleteConfirmFooter, DeletionConfirm } from "./DeletionConfirm";
import { ErrorDetails, ErrorDetailsFooter } from "./ErrorDetails";
import { Footer } from "./Footer";
import { NavigationUpdate, NavigationUpdateFooter } from "./NavigationUpdate";
import { NewNavigation, NewNavigationFooter } from "./NewNavigation";
import { SetState, State } from "./types";

interface Props {
  initialState: State;
  isOpened?: boolean;
  onClose?: VoidEffect;
}

export const NavigationManager = ({
  initialState,
  isOpened,
  onClose,
}: Props) => {
  const { formatMessage } = useIntl();
  const [state, setState] = useState(initialState);

  const {
    handleNavigationsDeletion,
    handleSubmitNavigation,
    hardReset,
  } = useDataManager();

  const {
    availableNavigations,
  } = useAvailableNavigations();

  const navigations = useMemo(() => sortBy(availableNavigations, "id"), [availableNavigations]);

  const onReset = useCallback(() => setState({ view: "INITIAL" }), [setState]);

  const onSubmit = useCallback(async () => {
    const performAction =
      state.view === "DELETE"
        ? async () => {
            await handleNavigationsDeletion(state.navigations.map(prop("id")));
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
  const footer = renderFooter({
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
      {footer}
    </ModalLayout>
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
      return <AllNavigations {...state} {...commonProps} />;
    }
    case "EDIT": {
      return <NavigationUpdate {...state} {...commonProps} />;
    }
    case "CREATE": {
      return <NewNavigation {...state} {...commonProps} />;
    }
    case "DELETE": {
      return <DeletionConfirm {...state} {...commonProps} />;
    }
    case "INITIAL": {
      return <Loader small />;
    }
    case "ERROR": {
      return <ErrorDetails {...state} {...commonProps} />;
    }
    default:
      return handleUnknownState(state);
  }
};

const renderFooter: Footer = (props) => {
  switch (props.state.view) {
    case "LIST": {
      return <AllNavigationsFooter {...props} />;
    }
    case "CREATE": {
      return <NewNavigationFooter {...props} />;
    }
    case "EDIT": {
      return <NavigationUpdateFooter {...props} />;
    }
    case "DELETE": {
      return <DeleteConfirmFooter {...props} />;
    }
    case "ERROR": {
      return <ErrorDetailsFooter {...props} />;
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
