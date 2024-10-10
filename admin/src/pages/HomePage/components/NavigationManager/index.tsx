import { Flex, Loader, Modal } from '@strapi/design-system';
import { useNotification } from '@strapi/strapi/admin';
import { sortBy } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { getTrad } from '../../../../translations';
import { VoidEffect } from '../../../../types';
import {
  useCreateNavigation,
  useDeleteNavigations,
  useHardReset,
  useLocale,
  useNavigations,
  usePurgeNavigation,
  useUpdateNavigation,
} from '../../hooks';
import { getPendingAction } from '../../utils';
import { AllNavigations, AllNavigationsFooter } from './AllNavigations';
import { DeleteConfirmFooter, DeletionConfirm } from './DeletionConfirm';
import { ErrorDetails, ErrorDetailsFooter } from './ErrorDetails';
import { Footer } from './Footer';
import { NavigationUpdate, NavigationUpdateFooter } from './NavigationUpdate';
import { NewNavigation, NewNavigationFooter } from './NewNavigation';
import { PurgeCacheConfirm, PurgeCacheConfirmFooter } from './PurgeCacheConfirm';
import { SetState, State } from './types';
import { Typography } from '@strapi/design-system';

interface Props {
  initialState: State;
  isOpened?: boolean;
  onClose?: VoidEffect;
}

export const NavigationManager = ({ initialState, isOpened, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const [state, setState] = useState(initialState);

  const { toggleNotification } = useNotification();

  const hardReset = useHardReset();

  const deleteNavigationsMutation = useDeleteNavigations();

  const createNavigationMutation = useCreateNavigation();

  const updateNavigationMutation = useUpdateNavigation();

  const purgeNavigationsMutation = usePurgeNavigation();

  const navigationsQuery = useNavigations();

  const localeQuery = useLocale();

  const navigations = useMemo(
    () => sortBy(navigationsQuery.data ?? [], 'id'),
    [navigationsQuery.data]
  );

  const pending = getPendingAction([
    deleteNavigationsMutation,
    navigationsQuery,
    createNavigationMutation,
    updateNavigationMutation,
    purgeNavigationsMutation,
    localeQuery,
  ]);

  const onReset = useCallback(() => setState({ view: 'INITIAL' }), [setState]);

  const onSubmit = useCallback(async () => {
    const performAction =
      state.view === 'DELETE'
        ? () => {
          deleteNavigationsMutation.mutate(
            state.navigations.reduce<string[]>((acc, navigation) => {
              if (navigation.documentId) {
                acc.push(navigation.documentId);
              }

              return acc;
            }, []),
            {
              onSuccess: hardReset,
            }
          );
        }
        : state.view === 'EDIT'
          ? () => {
            updateNavigationMutation.mutate(state.current, {
              onSuccess() {
                hardReset();
                toggleNotification({
                  type: 'success',
                  message: formatMessage(getTrad('notification.navigation.submit')),
                });
              },
              onError(error) {
                // TODO: handle errors
                console.warn(error);

                toggleNotification({
                  type: 'warning',
                  message: formatMessage(getTrad('notification.navigation.error'), {
                    errorTitles: '',
                  }),
                });
              },
            });
          }
          : state.view === 'CREATE' && state.current
            ? () => {
              createNavigationMutation.mutate(state.current, {
                onSuccess() {
                  hardReset();
                  toggleNotification({
                    type: 'success',
                    message: formatMessage(getTrad('notification.navigation.submit')),
                  });
                },
                onError(error) {
                  // TODO: handle errors
                  console.warn(error);

                  toggleNotification({
                    type: 'warning',
                    message: formatMessage(getTrad('notification.navigation.error'), {
                      errorTitles: '',
                    }),
                  });
                },
              });
            }
            : state.view === 'CACHE_PURGE'
              ? () => {
                purgeNavigationsMutation.mutate(
                  state.navigations.reduce<string[]>((acc, navigation) => {
                    if (navigation.documentId) {
                      acc.push(navigation.documentId);
                    }

                    return acc;
                  }, []),
                  {
                    onSuccess: hardReset,
                  }
                );
              }
              : () => { };

    try {
      performAction();
      setState({ view: 'INITIAL' });
    } catch (error) {
      setState({
        view: 'ERROR',
        errors: error instanceof Error ? [error] : [],
      });
    }
  }, [
    state,
    setState,
    hardReset,
    createNavigationMutation,
    purgeNavigationsMutation,
    updateNavigationMutation,
    deleteNavigationsMutation,
    toggleNotification,
    formatMessage,
    getTrad,
  ]);

  useEffect(() => {
    if (state.view === 'INITIAL' || state.view === 'LIST') {
      setState({
        view: 'LIST',
        navigations,
        selected: [],
      });
    }
  }, [state.view, navigations]);

  const header = renderHeader(state, formatMessage, !!pending);
  const content = renderContent(state, setState, !!pending);
  const footer = renderFooter({
    state,
    setState,
    onClose,
    onSubmit,
    onReset,
    navigations,
    isLoading: !!pending,
  });

  return (
    <Modal.Root
      labelledBy="condition-modal-breadcrumbs"
      onOpenChange={(isOpen: boolean) => {
        if (!isOpen) {
          onClose?.();
        }
      }}
      open={isOpened}
    >
      <Modal.Content>
        <Modal.Header>
          <Typography
            variant="omega"
            fontWeight="bold"
            textColor="neutral800"
            as="h2">
            {header}
          </Typography>
        </Modal.Header>
        <Modal.Body>{content}</Modal.Body>
        {footer}
      </Modal.Content>
    </Modal.Root>
  );
};

const renderHeader = (
  state: State,
  formatMessage: ReturnType<typeof useIntl>['formatMessage'],
  isLoading: boolean
) => {
  switch (state.view) {
    case 'LIST':
    case 'CREATE':
    case 'ERROR':
    case 'CACHE_PURGE':
    case 'DELETE': {
      return (
        <Flex direction="row">
          {isLoading ? <Loader small /> : null}
          {formatMessage(getTrad(`popup.navigation.manage.header.${state.view}`))}
        </Flex>
      );
    }
    case 'EDIT': {
      return (
        <Flex direction="row">
          {isLoading ? <Loader small /> : null}

          {formatMessage(getTrad('popup.navigation.manage.header.EDIT'), {
            name: state.navigation.name,
          })}
        </Flex>
      );
    }
    case 'INITIAL': {
      return null;
    }
    default:
      return handleUnknownState(state);
  }
};

const renderContent = (state: State, setState: SetState, isLoading: boolean) => {
  const commonProps = {
    setState,
    isLoading,
  };

  switch (state.view) {
    case 'LIST': {
      return <AllNavigations {...state} {...commonProps} />;
    }
    case 'EDIT': {
      return <NavigationUpdate {...state} {...commonProps} />;
    }
    case 'CREATE': {
      return <NewNavigation {...state} {...commonProps} />;
    }
    case 'DELETE': {
      return <DeletionConfirm {...state} {...commonProps} />;
    }
    case 'CACHE_PURGE': {
      return <PurgeCacheConfirm {...state} {...commonProps} />;
    }
    case 'INITIAL': {
      return <Loader small />;
    }
    case 'ERROR': {
      return <ErrorDetails {...state} {...commonProps} />;
    }
    default:
      return handleUnknownState(state);
  }
};

const renderFooter: Footer = (props) => {
  switch (props.state.view) {
    case 'LIST': {
      return <AllNavigationsFooter {...props} />;
    }
    case 'CREATE': {
      return <NewNavigationFooter {...props} />;
    }
    case 'EDIT': {
      return <NavigationUpdateFooter {...props} />;
    }
    case 'DELETE': {
      return <DeleteConfirmFooter {...props} />;
    }
    case 'CACHE_PURGE': {
      return <PurgeCacheConfirmFooter {...props} />;
    }
    case 'ERROR': {
      return <ErrorDetailsFooter {...props} />;
    }
    case 'INITIAL': {
      return null;
    }
    default:
      return handleUnknownState(props.state);
  }
};

const handleUnknownState = (state: undefined | { view: string }) => {
  console.warn(`Unknown state "${state?.view}". (${JSON.stringify(state)})`);

  return null;
};
