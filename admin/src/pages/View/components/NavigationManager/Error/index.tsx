// @ts-ignore
import { Button } from "@strapi/design-system/Button";
// @ts-ignore
import { Grid, GridItem } from "@strapi/design-system/Grid";
// @ts-ignore
import { useNotification } from "@strapi/helper-plugin";
import React, { useCallback, useEffect } from "react";
import { getMessage } from "../../../../../utils";
import { CommonProps, ErrorState } from "../types";

interface Props extends ErrorState, CommonProps {}

export const ErrorView = ({ errors, setState }: Props) => {
  const goBack = useCallback(() => {
    setState({ view: "INITIAL" });
  }, [setState]);
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
      <GridItem col={12} paddingBottom={3}>
        {getMessage("popup.navigation.manage.error.message")}
      </GridItem>
      <GridItem col={12}>
        <Button onClick={goBack}>
          {getMessage("popup.navigation.manage.button.goBack")}
        </Button>
      </GridItem>
    </Grid>
  );
};
