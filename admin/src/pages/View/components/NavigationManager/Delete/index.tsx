// @ts-ignore
import { Button } from "@strapi/design-system/Button";
// @ts-ignore
import { Flex } from "@strapi/design-system/Flex";
// @ts-ignore
import { Grid, GridItem } from "@strapi/design-system/Grid";
// @ts-ignore
import { Typography } from "@strapi/design-system/Typography";
import React from "react";
import { getMessage } from "../../../../../utils";
import {
  CommonProps,
  DeleteState,
  FooterActionsFactory,
  Navigation,
} from "../types";

interface Props extends DeleteState, CommonProps {}

export const Delete = ({ navigations }: Props) => (
  <Grid>
    <GridItem col={12} paddingBottom={1}>
      <Flex>
        <Typography variant="beta">
          {getMessage("popup.navigation.manage.delete.header")}
        </Typography>
      </Flex>
    </GridItem>
    <GridItem col={12} paddingBottom={1}>
      <Typography variant="omega" fontWeight="semiBold">
        {renderItems(navigations)}
      </Typography>
    </GridItem>
  </Grid>
);

export const deleteFooterActions: FooterActionsFactory = ({
  state,
  onSubmit,
  onReset,
}) => {
  return {
    startActions: (
      <Button disabled={state.isLoading} onClick={onReset} variant="tertiary">
        {getMessage("popup.item.form.button.cancel")}
      </Button>
    ),
    endActions: (
      <Button disabled={state.isLoading} onClick={onSubmit} variant="danger">
        {getMessage("popup.navigation.manage.button.delete")}
      </Button>
    ),
  };
};

const renderItems = (navigations: Array<Navigation>) =>
  navigations.map(({ name }) => `"${name}"`).join(", ");
