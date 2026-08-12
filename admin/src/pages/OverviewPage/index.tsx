import {
  Button,
  EmptyStateLayout,
  Flex,
  IconButton,
  Status,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Typography,
  VisuallyHidden,
} from '@strapi/design-system';
import { Feather, Pencil, Plus, Trash } from '@strapi/icons';
import { EmptyDocuments } from '@strapi/icons/symbols';
import { Layouts, Page, useNotification } from '@strapi/strapi/admin';
import { sortBy } from 'lodash';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import {
  useConfig,
  useCreateNavigation,
  useDeleteNavigations,
  useHardReset,
  useLocale,
  useNavigations,
  usePurgeNavigation,
  useSettingsPermissions,
  useUpdateNavigation,
} from '../../hooks';
import { PLUGIN_ID } from '../../pluginId';
import { getTrad } from '../../translations';
import { NavigationFormModal } from './components/NavigationFormModal';
import { Navigation } from './types';

const INITIAL_NAVIGATION: Partial<Navigation> = {
  name: '',
  items: [],
  visible: false,
};

type OverlayState =
  | { type: 'create' }
  | { type: 'edit'; navigation: Navigation }
  | { type: 'delete'; navigation: Navigation }
  | { type: 'purge'; navigation?: Navigation }
  | null;

const OverviewPage = () => {
  const { formatMessage } = useIntl();
  const navigate = useNavigate();
  const { toggleNotification } = useNotification();

  const navigationsQuery = useNavigations();
  const localeQuery = useLocale();
  const configQuery = useConfig();
  const { canUpdate, isLoadingForPermissions } = useSettingsPermissions();

  const createNavigationMutation = useCreateNavigation();
  const updateNavigationMutation = useUpdateNavigation({});
  const deleteNavigationsMutation = useDeleteNavigations();
  const purgeNavigationsMutation = usePurgeNavigation();
  const hardReset = useHardReset();

  const [overlay, setOverlay] = useState<OverlayState>(null);

  const navigations = useMemo(
    () => sortBy(navigationsQuery.data ?? [], 'id'),
    [navigationsQuery.data]
  );

  const defaultLocaleNavigations = useMemo(
    () => navigations.filter(({ locale }) => locale === localeQuery.data?.defaultLocale),
    [navigations, localeQuery.data?.defaultLocale]
  );

  const hasCache = !!configQuery.data?.isCacheEnabled;

  const isMutating =
    createNavigationMutation.isPending ||
    updateNavigationMutation.isPending ||
    deleteNavigationsMutation.isPending ||
    purgeNavigationsMutation.isPending;

  const getLocaleVersions = (focused: Navigation) =>
    [focused].concat(
      navigations.filter(
        (navigation) =>
          navigation.documentId === focused.documentId && navigation.locale !== focused.locale
      )
    );

  const goToDetails = (navigation: Navigation) => {
    navigate(`/plugins/${PLUGIN_ID}/${navigation.documentId}`);
  };

  const handleFormSubmit = (updated: Partial<Navigation>) => {
    const options = {
      onSuccess() {
        hardReset();
        setOverlay(null);
        toggleNotification({
          type: 'success',
          message: formatMessage(getTrad('notification.navigation.submit')),
        });
      },
      onError(error: unknown) {
        console.warn(error);
        toggleNotification({
          type: 'warning',
          message: formatMessage(getTrad('notification.error.common')),
        });
      },
    };

    if (overlay?.type === 'edit') {
      updateNavigationMutation.mutate(updated as Navigation, options);
    } else {
      createNavigationMutation.mutate(updated as Navigation, options);
    }
  };

  const handleDelete = () => {
    if (overlay?.type !== 'delete') {
      return;
    }

    deleteNavigationsMutation.mutate([overlay.navigation.documentId], {
      onSuccess() {
        hardReset();
        setOverlay(null);
      },
    });
  };

  const handlePurge = () => {
    if (overlay?.type !== 'purge') {
      return;
    }

    purgeNavigationsMutation.mutate(
      overlay.navigation ? [overlay.navigation.documentId] : undefined,
      {
        onSuccess() {
          hardReset();
          setOverlay(null);
        },
      }
    );
  };

  if (
    navigationsQuery.isPending ||
    localeQuery.isPending ||
    configQuery.isPending ||
    isLoadingForPermissions
  ) {
    return <Page.Loading />;
  }

  return (
    <Layouts.Root>
      <Page.Title children={formatMessage(getTrad('header.title', 'UI Navigation'))} />
      <Page.Main>
        <Layouts.Header
          title={formatMessage(getTrad('header.title', 'UI Navigation'))}
          subtitle={formatMessage(getTrad('pages.overview.header.subtitle'), {
            count: defaultLocaleNavigations.length,
          })}
          primaryAction={
            canUpdate && (
              <Flex gap={2}>
                {hasCache && (
                  <Button
                    variant="danger-light"
                    startIcon={<Feather />}
                    onClick={() => setOverlay({ type: 'purge' })}
                  >
                    {formatMessage(getTrad('popup.navigation.manage.button.purge'))}
                  </Button>
                )}
                <Button startIcon={<Plus />} onClick={() => setOverlay({ type: 'create' })}>
                  {formatMessage(getTrad('popup.navigation.manage.header.CREATE'))}
                </Button>
              </Flex>
            )
          }
        />
        <Layouts.Content>
          {defaultLocaleNavigations.length === 0 ? (
            <EmptyStateLayout
              icon={<EmptyDocuments width="16rem" />}
              content={formatMessage(getTrad('pages.overview.empty.description'))}
              action={
                canUpdate && (
                  <Button
                    variant="secondary"
                    startIcon={<Plus />}
                    onClick={() => setOverlay({ type: 'create' })}
                  >
                    {formatMessage(getTrad('popup.navigation.manage.header.CREATE'))}
                  </Button>
                )
              }
            />
          ) : (
            <Table colCount={5} rowCount={defaultLocaleNavigations.length + 1}>
              <Thead>
                <Tr>
                  <Th>
                    <Typography variant="sigma" textColor="neutral600">
                      {formatMessage(getTrad('popup.navigation.manage.table.name'))}
                    </Typography>
                  </Th>
                  <Th>
                    <Typography variant="sigma" textColor="neutral600">
                      {formatMessage(getTrad('popup.navigation.manage.table.locale'))}
                    </Typography>
                  </Th>
                  <Th>
                    <Typography variant="sigma" textColor="neutral600">
                      {formatMessage(getTrad('popup.navigation.manage.table.visibility'))}
                    </Typography>
                  </Th>
                  <Th>
                    <Typography variant="sigma" textColor="neutral600">
                      {formatMessage(getTrad('pages.overview.table.items'))}
                    </Typography>
                  </Th>
                  <Th>
                    <VisuallyHidden>
                      {formatMessage(getTrad('pages.overview.table.actions'))}
                    </VisuallyHidden>
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {defaultLocaleNavigations.map((navigation) => (
                  <Tr
                    key={navigation.documentId}
                    onClick={() => goToDetails(navigation)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Td>
                      <Typography textColor="neutral800" fontWeight="bold">
                        {navigation.name}
                      </Typography>
                    </Td>
                    <Td>
                      <Typography textColor="neutral800">
                        {getLocaleVersions(navigation)
                          .map(({ locale }) => locale)
                          .join(', ')}
                      </Typography>
                    </Td>
                    <Td>
                      <Status
                        size="S"
                        variant={navigation.visible ? 'success' : 'secondary'}
                        maxWidth="min-content"
                      >
                        <Typography tag="span" variant="omega" fontWeight="bold">
                          {navigation.visible
                            ? formatMessage(getTrad('popup.navigation.form.visible.toggle.visible'))
                            : formatMessage(getTrad('popup.navigation.form.visible.toggle.hidden'))}
                        </Typography>
                      </Status>
                    </Td>
                    <Td>
                      <Typography textColor="neutral800">{navigation.items.length}</Typography>
                    </Td>
                    <Td onClick={(event: React.MouseEvent) => event.stopPropagation()}>
                      <Flex justifyContent="flex-end" gap={1}>
                        {canUpdate && (
                          <IconButton
                            onClick={() => setOverlay({ type: 'edit', navigation })}
                            label={formatMessage(getTrad('popup.navigation.manage.button.edit'))}
                            variant="ghost"
                          >
                            <Pencil />
                          </IconButton>
                        )}
                        {canUpdate && (
                          <IconButton
                            onClick={() => setOverlay({ type: 'delete', navigation })}
                            label={formatMessage(getTrad('popup.navigation.manage.button.delete'))}
                            variant="ghost"
                          >
                            <Trash />
                          </IconButton>
                        )}
                        {canUpdate && hasCache && (
                          <IconButton
                            onClick={() => setOverlay({ type: 'purge', navigation })}
                            label={formatMessage(getTrad('popup.navigation.manage.button.purge'))}
                            variant="ghost"
                          >
                            <Feather />
                          </IconButton>
                        )}
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}

          {(overlay?.type === 'create' || overlay?.type === 'edit') && (
            <NavigationFormModal
              navigation={overlay.type === 'edit' ? overlay.navigation : INITIAL_NAVIGATION}
              alreadyUsedNames={defaultLocaleNavigations.reduce<Array<string>>(
                (acc, { name }) =>
                  overlay.type === 'edit' && name === overlay.navigation.name
                    ? acc
                    : acc.concat([name]),
                []
              )}
              isLoading={isMutating}
              onClose={() => setOverlay(null)}
              onSubmit={handleFormSubmit}
            />
          )}

          {overlay?.type === 'delete' && (
            <ConfirmationDialog
              isVisible
              isActionAsync={isMutating}
              header={formatMessage(getTrad('popup.navigation.manage.header.DELETE'))}
              labelConfirm={formatMessage(getTrad('popup.navigation.manage.button.delete'))}
              iconConfirm={<Trash />}
              onConfirm={handleDelete}
              onCancel={() => setOverlay(null)}
            >
              {`${formatMessage(getTrad('popup.navigation.manage.delete.header'))} "${overlay.navigation.name}"`}
            </ConfirmationDialog>
          )}

          {overlay?.type === 'purge' && (
            <ConfirmationDialog
              isVisible
              isActionAsync={isMutating}
              header={formatMessage(getTrad('popup.navigation.manage.button.purge'))}
              labelConfirm={formatMessage(getTrad('popup.navigation.manage.footer.button.purge'))}
              iconConfirm={<Feather />}
              onConfirm={handlePurge}
              onCancel={() => setOverlay(null)}
            >
              {overlay.navigation
                ? `${formatMessage(getTrad('popup.navigation.manage.purge.header'))} "${overlay.navigation.name}"`
                : formatMessage(getTrad('popup.navigation.manage.purge.header'))}
            </ConfirmationDialog>
          )}
        </Layouts.Content>
      </Page.Main>
    </Layouts.Root>
  );
};

export { OverviewPage };
