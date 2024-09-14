import {
  Box,
  Button,
  Checkbox,
  Flex,
  Grid,
  IconButton,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Typography,
} from '@strapi/design-system';
import { prop } from 'lodash/fp';
import { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';

import { getTrad } from '../../../../../translations';
import { useConfig, useLocale } from '../../../hooks';
import { Footer, FooterBase } from '../Footer';
import { INITIAL_NAVIGATION } from '../NewNavigation';
import { CommonProps, ListState, Navigation } from '../types';
import * as icons from './icons';

interface Props extends ListState, CommonProps { }

export const AllNavigations = ({ navigations, selected, setState }: Props) => {
  const configQuery = useConfig();

  const hasAnySelected = !!selected.length;

  const { formatMessage } = useIntl();

  const localeQuery = useLocale();

  const toggleSelected = useCallback(
    () =>
      setState({
        navigations,
        selected: hasAnySelected ? [] : navigations.map((n) => n),
        view: 'LIST',
      }),
    [setState, navigations, hasAnySelected]
  );

  const currentlySelectedSet = useMemo(() => new Set(selected.map(prop('id'))), [selected]);

  const handleSelect = (navigation: Navigation, isSelected: boolean) => () => {
    setState({
      navigations,
      selected: isSelected
        ? selected.filter(({ id }) => id !== navigation.id)
        : selected.concat([navigation]),
      view: 'LIST',
    });
  };

  const edit = (navigation: Navigation) => () => {
    setState({
      view: 'EDIT',
      current: navigation,
      navigation,
      alreadyUsedNames: navigations.reduce<string[]>(
        (acc, { name }) => (name !== navigation.name ? acc.concat([name]) : acc),
        []
      ),
    });
  };

  const _delete = (navigations: Array<Navigation>) => () => {
    setState({
      view: 'DELETE',
      navigations,
    });
  };

  const purgeCache = (navigations: Array<Navigation>) => () => {
    setState({
      view: 'CACHE_PURGE',
      navigations,
    });
  };

  const deleteSelected = useCallback(_delete(selected), [_delete]);

  const purgeSelected = useCallback(purgeCache(selected), [purgeCache]);

  const getLocalizations = (focused: Navigation) =>
    [focused].concat(
      navigations.filter(
        (navigation) => navigation.documentId === focused.documentId && navigation.id !== focused.id
      )
    );

  return (
    <>
      <Grid.Root>
        <Grid.Item col={12} paddingBottom={3}>
          {hasAnySelected ? (
            <Flex direction="row" gap={1}>
              <Box paddingRight={3}>
                {formatMessage(getTrad('popup.navigation.manage.table.hasSelected'), {
                  count: selected.length,
                })}
              </Box>
              <Button onClick={deleteSelected} variant="tertiary">
                {formatMessage(getTrad('popup.navigation.manage.button.delete'))}
              </Button>
              {configQuery.data?.isCacheEnabled ? (
                <Button onClick={purgeSelected} variant="tertiary">
                  {formatMessage(getTrad('popup.navigation.manage.button.purge'))}
                </Button>
              ) : null}
            </Flex>
          ) : null}
        </Grid.Item>
      </Grid.Root>
      <Table rowCount={navigations.length} colCount={6}>
        <Thead>
          <Tr>
            <Th>
              <Checkbox onCheckedChange={toggleSelected} check={hasAnySelected} />
            </Th>
            <Th>
              <Typography textColor="neutral800">
                {formatMessage(getTrad('popup.navigation.manage.table.id'))}
              </Typography>
            </Th>
            <Th>
              <Typography textColor="neutral800">
                {formatMessage(getTrad('popup.navigation.manage.table.name'))}
              </Typography>
            </Th>
            <Th>
              <Typography textColor="neutral800">
                {formatMessage(getTrad('popup.navigation.manage.table.locale'))}
              </Typography>
            </Th>
            <Th>
              <Typography textColor="neutral800">
                {formatMessage(getTrad('popup.navigation.manage.table.visibility'))}
              </Typography>
            </Th>
            <Th>
              {configQuery.data?.isCacheEnabled ? (
                <Flex direction="row">
                  <Box paddingLeft={1}>
                    <IconButton
                      onClick={purgeCache([])}
                      label={formatMessage(getTrad('popup.navigation.manage.button.purge'))}
                      noBorder
                      children={icons.featherIcon}
                    />
                  </Box>
                </Flex>
              ) : null}
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {navigations
            .filter(({ localeCode }) => localeCode === localeQuery.data?.defaultLocale)
            .map((navigation) => (
              <Tr key={navigation.id}>
                <Td>
                  <Checkbox
                    onCheckedChange={handleSelect(
                      navigation,
                      currentlySelectedSet.has(navigation.id)
                    )}
                    checked={currentlySelectedSet.has(navigation.id)}
                  />
                </Td>
                <Td>
                  <Typography textColor="neutral800">{navigation.id}</Typography>
                </Td>
                <Td>
                  <Typography textColor="neutral800">{navigation.name}</Typography>
                </Td>
                <Td>
                  <Typography textColor="neutral800">
                    {getLocalizations(navigation).map(prop('localeCode')).join(', ')}
                  </Typography>
                </Td>
                <Td>
                  <Typography textColor="neutral800">
                    {navigation.visible
                      ? formatMessage(getTrad('popup.navigation.manage.navigation.visible'))
                      : formatMessage(getTrad('popup.navigation.manage.navigation.hidden'))}
                  </Typography>
                </Td>
                <Td>
                  <Flex width="100%" direction="row" alignItems="center" justifyContent="flex-end">
                    <Box paddingLeft={1}>
                      <IconButton
                        onClick={edit(navigation)}
                        label={formatMessage(getTrad('popup.navigation.manage.button.edit'))}
                        noBorder
                        children={icons.edit}
                      />
                    </Box>
                    <Box paddingLeft={1}>
                      <IconButton
                        onClick={_delete([navigation])}
                        label={formatMessage(getTrad('popup.navigation.manage.button.delete'))}
                        noBorder
                        children={icons.deleteIcon}
                      />
                    </Box>
                    {configQuery.data?.isCacheEnabled ? (
                      <Box paddingLeft={1}>
                        <IconButton
                          onClick={purgeCache([navigation])}
                          label={formatMessage(getTrad('popup.navigation.manage.button.purge'))}
                          noBorder
                          children={icons.featherIcon}
                        />
                      </Box>
                    ) : null}
                  </Flex>
                </Td>
              </Tr>
            ))}
        </Tbody>
      </Table>
    </>
  );
};

export const AllNavigationsFooter: Footer = ({
  onClose,
  state,
  setState,
  navigations,
  isLoading,
}) => {
  const { formatMessage } = useIntl();

  return (
    <FooterBase
      start={{
        onClick: onClose,
        variant: 'tertiary',
        disabled: isLoading,
        children: formatMessage(getTrad('popup.item.form.button.cancel')),
      }}
      end={{
        onClick: () =>
          setState({
            view: 'CREATE',
            alreadyUsedNames: navigations.map(({ name }) => name),
            current: INITIAL_NAVIGATION,
          }),
        variant: 'default',
        disabled: isLoading,
        children: formatMessage(getTrad('popup.navigation.manage.button.create')),
      }}
    />
  );
};
