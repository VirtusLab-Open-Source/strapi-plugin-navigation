// @ts-ignore
import { Button } from "@strapi/design-system/Button";
import React, { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import { getMessage } from "../../../../../utils";
import { Footer, FooterBase } from "../Footer";
import { Form, validationSchemaFactory } from "../Form";
import {
  CommonProps,
  CreateState,
  Navigation,
} from "../types";

interface Props extends CreateState, CommonProps {}

export const INITIAL_NAVIGATION = {
  name: "Navigation",
  items: [],
  visible: true,
} as unknown as Navigation;

export const NewNavigation = ({
  setState,
  current,
  isLoading,
  alreadyUsedNames,
}: Props) => {
  const { formatMessage } = useIntl();

  const onSubmit = useCallback(
    (updated: Navigation) => {
      setState({
        view: "CREATE",
        current: updated,
        alreadyUsedNames,
      });
    },
    [setState]
  );

  const validationSchema = useMemo(
    () => validationSchemaFactory(alreadyUsedNames, formatMessage),
    [alreadyUsedNames]
  );

  return (
    <Form
      navigation={current}
      onChange={onSubmit}
      isLoading={isLoading}
      validationSchema={validationSchema}
    />
  );
};

export const NewNavigationFooter: Footer = ({
  state,
  onSubmit,
  onReset,
}) => (
  <FooterBase
    start={{
      children: getMessage("popup.item.form.button.cancel"),
      variant: "tertiary",
      disabled: state.isLoading,
      onClick: onReset,
    }}
    end={{
      children: getMessage("popup.navigation.manage.button.save"),
      variant: "default",
      disabled: state.isLoading,
      onClick: onSubmit,
    }}
  />
);
