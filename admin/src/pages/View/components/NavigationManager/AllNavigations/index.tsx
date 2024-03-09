// @ts-ignore
import { BaseCheckbox } from "@strapi/design-system/BaseCheckbox";
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
import { Typography } from "@strapi/design-system/Typography";
import { prop } from "lodash/fp";
import React, { useCallback, useMemo } from "react";
import useDataManager from "../../../../../hooks/useDataManager";
import { getMessage } from "../../../../../utils";
import { Footer, FooterBase } from "../Footer";
import { INITIAL_NAVIGATION } from "../NewNavigation";
import { CommonProps, ListState, Navigation } from "../types";
import * as icons from "./icons";

interface Props extends ListState, CommonProps {}

export const AllNavigations = ({ navigations, selected, setState }: Props) => {
  const {
    config: { i18nEnabled, isCacheEnabled },
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
    () => new Set(selected.map(prop("id"))),
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
      alreadyUsedNames: navigations.reduce<string[]>(
        (acc, { name }) =>
          name !== navigation.name ? acc.concat([name]) : acc,
        []
      ),
    });
  };

  const _delete = (navigations: Array<Navigation>) => () => {
    setState({
      view: "DELETE",
      navigations,
    });
  };

  const purgeCache = (navigations: Array<Navigation>) => () => {
    setState({
      view: "CACHE_PURGE",
      navigations,
    });
  };

  const deleteSelected = useCallback(_delete(selected), [_delete]);

  const purgeSelected = useCallback(purgeCache(selected), [purgeCache]);

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
              {isCacheEnabled ? (
                <Button onClick={purgeSelected} variant="tertiary">
                  {getMessage("popup.navigation.manage.button.purge")}
                </Button>
              ) : null}
            </Flex>
          ) : null}
        </GridItem>
      </Grid>
      <Table rowCount={navigations.length} colCount={i18nEnabled ? 6 : 5}>
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
            <Th>
              {isCacheEnabled ? (
                <Flex direction="row">
                  <Box paddingLeft={1}>
                    <IconButton
                      onClick={purgeCache([])}
                      label={getMessage("popup.navigation.manage.button.purge")}
                      noBorder
                      icon={icons.brushIcon}
                    />
                  </Box>
                </Flex>
              ) : null}
            </Th>
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
                        navigation.localizations?.map(prop("localeCode")) || []
                      )
                      .join(", ")}
                  </Typography>
                </Td>
              ) : null}
              <Td>
                {navigation.visible
                  ? getMessage("popup.navigation.manage.navigation.visible")
                  : getMessage("popup.navigation.manage.navigation.hidden")}
              </Td>
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
                      icon={icons.deleteIcon}
                    />
                  </Box>
                  {isCacheEnabled ? (
                    <Box paddingLeft={1}>
                      <IconButton
                        onClick={purgeCache([navigation])}
                        label={getMessage(
                          "popup.navigation.manage.button.purge"
                        )}
                        noBorder
                        icon={icons.brushIcon}
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
}) => (
  <FooterBase
    start={{
      onClick: onClose,
      variant: "tertiary",
      disabled: state.isLoading,
      children: getMessage("popup.item.form.button.cancel"),
    }}
    end={{
      onClick: () =>
        setState({
          view: "CREATE",
          alreadyUsedNames: navigations.map(({ name }) => name),
          current: INITIAL_NAVIGATION,
        }),
      variant: "default",
      disabled: state.isLoading,
      children: getMessage("popup.navigation.manage.button.create"),
    }}
  />
);
