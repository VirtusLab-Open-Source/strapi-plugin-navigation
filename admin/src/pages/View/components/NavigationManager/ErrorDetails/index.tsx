// @ts-ignore
import { Grid, GridItem } from "@strapi/design-system/Grid";
// @ts-ignore
import { useNotification } from "@strapi/helper-plugin";
import React, { useEffect } from "react";
import { getMessage } from "../../../../../utils";
import { Footer, FooterBase } from "../Footer";
import { CommonProps, ErrorState } from "../types";

interface Props extends ErrorState, CommonProps {}

export const ErrorDetails = ({ errors }: Props) => {
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

export const ErrorDetailsFooter: Footer = ({ onReset }) => (
  <FooterBase
    end={{
      children: getMessage("popup.navigation.manage.button.goBack"),
      onClick: onReset,
      variant: "secondary",
    }}
  />
);
