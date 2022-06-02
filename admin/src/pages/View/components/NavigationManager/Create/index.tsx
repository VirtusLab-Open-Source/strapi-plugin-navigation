// @ts-ignore
import { Button } from "@strapi/design-system/Button";
import React, { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import { getMessage } from "../../../../../utils";
import { Form, validationSchemaFactory } from "../Form";
import {
  CommonProps,
  CreateState,
  FooterActionsFactory,
  Navigation,
} from "../types";

interface Props extends CreateState, CommonProps {}

export const INITIAL_NAVIGATION = {
  name: "Navigation",
  items: [],
  visible: true,
} as unknown as Navigation;

export const Create = ({
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

export const createFooterActions: FooterActionsFactory = ({
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
      <Button disabled={state.isLoading} onClick={onSubmit} variant="primary">
        {getMessage("popup.navigation.manage.button.save")}
      </Button>
    ),
  };
};
