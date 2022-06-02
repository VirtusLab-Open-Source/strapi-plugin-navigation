// @ts-ignore
import { BaseCheckbox } from "@strapi/design-system/BaseCheckbox";
// @ts-ignore
import { Typography } from "@strapi/design-system/Typography";
// @ts-ignore
import { Box } from "@strapi/design-system/Box";
// @ts-ignore
import { Button } from "@strapi/design-system/Button";
// @ts-ignore
import { Flex } from "@strapi/design-system/Flex";
// @ts-ignore
import { Grid, GridItem } from "@strapi/design-system/Grid";
// @ts-ignore
import { IconButton } from "@strapi/design-system/IconButton";
// @ts-ignore
import { Table, Tbody, Td, Th, Thead, Tr } from "@strapi/design-system/Table";
// @ts-ignore
import { Eye, EyeStriked, Pencil, Trash } from "@strapi/icons";
import React, { useCallback, useMemo } from "react";
import useDataManager from "../../../../../hooks/useDataManager";
import { getMessage } from "../../../../../utils";
import { INITIAL_NAVIGATION } from "../Create";
import {
  CommonProps,
  FooterActionsFactory,
  ListState,
  Navigation,
} from "../types";

interface Props extends ListState, CommonProps {}

export const List = ({ navigations, selected, setState }: Props) => {
  const {
    config: { i18nEnabled },
  } = useDataManager();
  const hasAnySelected = !!selected.length;
  const toggleSelected = useCallback(
    () =>
      setState({
        navigations,
        selected: hasAnySelected ? [] : navigations.map((n) => n),
        view: "LIST",
      }),
    [setState, navigations, hasAnySelected]
  );
  const currentlySelectedSet = useMemo(
    () => new Set(selected.map(({ id }) => id)),
    [selected]
  );
  const handleSelect = (navigation: Navigation, isSelected: boolean) => () => {
    setState({
      navigations,
      selected: isSelected
        ? selected.filter(({ id }) => id !== navigation.id)
        : selected.concat([navigation]),
      view: "LIST",
    });
  };
  const edit = (navigation: Navigation) => () => {
    setState({
      view: "EDIT",
      navigation,
      alreadyUsedNames: navigations
        .map(({ name }) => name)
        .filter((name) => name !== navigation.name),
    });
  };
  const _delete = (navigations: Array<Navigation>) => () => {
    setState({
      view: "DELETE",
      navigations,
    });
  };
  const deleteSelected = useCallback(_delete(selected), [_delete]);

  return (
    <>
      <Grid>
        <GridItem col={12} paddingBottom={3}>
          {hasAnySelected ? (
            <Flex direction="row" gap={1}>
              <Box paddingRight={3}>
                {getMessage({
                  id: "popup.navigation.manage.table.hasSelected",
                  props: {
                    count: selected.length,
                  },
                })}
              </Box>
              <Button onClick={deleteSelected} variant="tertiary">
                {getMessage("popup.navigation.manage.button.delete")}
              </Button>
            </Flex>
          ) : null}
        </GridItem>
      </Grid>
      <Table rowCount={navigations.concat} colCount={i18nEnabled ? 6 : 5}>
        <Thead>
          <Tr>
            <Th>
              <BaseCheckbox
                onValueChange={toggleSelected}
                value={hasAnySelected}
              />
            </Th>
            <Th>
              <Typography textColor="neutral800">
                {getMessage("popup.navigation.manage.table.id")}
              </Typography>
            </Th>
            <Th>
              <Typography textColor="neutral800">
                {getMessage("popup.navigation.manage.table.name")}
              </Typography>
            </Th>
            {i18nEnabled ? (
              <Th>
                <Typography textColor="neutral800">
                  {getMessage("popup.navigation.manage.table.locale")}
                </Typography>
              </Th>
            ) : null}
            <Th>
              <Typography textColor="neutral800">
                {getMessage("popup.navigation.manage.table.visibility")}
              </Typography>
            </Th>
            <Th />
          </Tr>
        </Thead>
        <Tbody>
          {navigations.map((navigation) => (
            <Tr key={navigation.id}>
              <Td>
                <BaseCheckbox
                  onValueChange={handleSelect(
                    navigation,
                    currentlySelectedSet.has(navigation.id)
                  )}
                  value={currentlySelectedSet.has(navigation.id)}
                />
              </Td>
              <Td>
                <Typography textColor="neutral800">{navigation.id}</Typography>
              </Td>
              <Td>
                <Typography textColor="neutral800">
                  {navigation.name}
                </Typography>
              </Td>
              {i18nEnabled ? (
                <Td>
                  <Typography textColor="neutral800">
                    {[navigation.localeCode]
                      .concat(
                        navigation.localizations?.map(
                          ({ localeCode }) => localeCode
                        ) || []
                      )
                      .join(", ")}
                  </Typography>
                </Td>
              ) : null}
              <Td>{navigation.visible ? icons.visible : icons.notVisible}</Td>
              <Td>
                <Flex direction="row">
                  <Box paddingLeft={1}>
                    <IconButton
                      onClick={edit(navigation)}
                      label={getMessage("popup.navigation.manage.button.edit")}
                      noBorder
                      icon={icons.edit}
                    />
                  </Box>
                  <Box paddingLeft={1}>
                    <IconButton
                      onClick={_delete([navigation])}
                      label={getMessage(
                        "popup.navigation.manage.button.delete"
                      )}
                      noBorder
                      icon={icons.delete}
                    />
                  </Box>
                </Flex>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </>
  );
};

export const listFooterActions: FooterActionsFactory = ({
  onClose,
  state,
  setState,
  navigations,
}) => {
  return {
    startActions: (
      <Button onClick={onClose} variant="tertiary" disabled={state.isLoading}>
        {getMessage("popup.item.form.button.cancel")}
      </Button>
    ),
    endActions: (
      <Button
        disabled={state.isLoading}
        onClick={() =>
          setState({
            view: "CREATE",
            alreadyUsedNames: navigations.map(({ name }) => name),
            current: INITIAL_NAVIGATION,
          })
        }
        variant="primary"
      >
        {getMessage("popup.navigation.manage.button.create")}
      </Button>
    ),
  };
};

const icons = {
  edit: <Pencil />,
  delete: <Trash />,
  visible: <Eye />,
  notVisible: <EyeStriked />,
} as const;
