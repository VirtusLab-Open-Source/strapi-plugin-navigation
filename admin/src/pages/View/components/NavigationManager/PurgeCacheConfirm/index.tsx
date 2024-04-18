// @ts-ignore
import { Button } from "@strapi/design-system/Button";
// @ts-ignore
import { Flex } from "@strapi/design-system/Flex";
// @ts-ignore
import { Grid, GridItem } from "@strapi/design-system/Grid";
// @ts-ignore
import { Typography } from "@strapi/design-system/Typography";
import { prop } from "lodash/fp";
import React from "react";
import { getMessage } from "../../../../../utils";
import { Footer, FooterBase } from "../Footer";
import { CommonProps, Navigation, PurgeCacheState } from "../types";

interface Props extends PurgeCacheState, CommonProps {}

export const PurgeCacheConfirm = ({ navigations }: Props) => (
  <Grid>
    <GridItem col={12} paddingBottom={1}>
      <Flex>
        <Typography variant="beta">
          {getMessage("popup.navigation.manage.purge.header")}
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

export const PurgeCacheConfirmFooter: Footer = ({ state, onSubmit, onReset }) => (
  <FooterBase
    start={{
      children: getMessage("popup.item.form.button.cancel"),
      disabled: state.isLoading,
      onClick: onReset,
      variant: "tertiary",
    }}
    end={{
      children: getMessage("popup.navigation.manage.footer.button.purge"),
      disabled: state.isLoading,
      onClick: onSubmit,
      variant: "danger",
    }}
  />
);

const renderItems = (navigations: Array<Navigation>) =>
  navigations.map(prop("name")).join(", ");
