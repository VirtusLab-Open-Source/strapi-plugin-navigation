// @ts-ignore
import { Button } from "@strapi/design-system/Button";
// @ts-ignore
import { Grid, GridItem } from "@strapi/design-system/Grid";
// @ts-ignore
import { useNotification } from "@strapi/helper-plugin";
import React, { useEffect } from "react";
import { getMessage } from "../../../../../utils";
import { CommonProps, ErrorState, FooterActionsFactory } from "../types";

interface Props extends ErrorState, CommonProps {}

export const ErrorView = ({ errors }: Props) => {
  const toggleNotification = useNotification();

  useEffect(() => {
    errors.map((error) => {
      toggleNotification({
        type: "warning",
        message: { id: "", defaultMessage: error.message },
      });
      console.error(error);
    });
  }, []);

  return (
    <Grid>
      <GridItem col={12}>
        {getMessage("popup.navigation.manage.error.message")}
      </GridItem>
    </Grid>
  );
};

export const errorFooterActions: FooterActionsFactory = ({ onReset }) => {
  return {
    endActions: (
      <Button onClick={onReset} variant="secondary">
        {getMessage("popup.navigation.manage.button.goBack")}
      </Button>
    ),
  };
};
