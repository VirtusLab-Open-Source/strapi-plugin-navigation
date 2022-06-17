// @ts-ignore
import { Button } from "@strapi/design-system/Button";
import React, { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import { getMessage } from "../../../../../utils";
import { Form, validationSchemaFactory } from "../Form";
import {
  CommonProps,
  EditState,
  FooterActionsFactory,
  Navigation,
} from "../types";

interface Props extends EditState, CommonProps {}

export const Edit = ({
  alreadyUsedNames,
  current,
  isLoading,
  navigation: initialValue,
  setState,
}: Props) => {
  const { formatMessage } = useIntl();
  const onChange = useCallback(
    (updated: Navigation) => {
      setState({
        view: "EDIT",
        alreadyUsedNames,
        current: updated,
        navigation: initialValue,
      });
    },
    [setState, initialValue, alreadyUsedNames]
  );
  const navigation: Partial<Navigation> = useMemo(
    () => current ?? initialValue,
    [current]
  );
  const validationSchema = useMemo(
    () => validationSchemaFactory(alreadyUsedNames, formatMessage),
    [alreadyUsedNames]
  );

  return (
    <Form
      navigation={navigation}
      onChange={onChange}
      isLoading={isLoading}
      validationSchema={validationSchema}
    />
  );
};

export const editFooterActions: FooterActionsFactory = ({
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
      <Button disabled={state.isLoading} onClick={onSubmit} variant="secondary">
        {getMessage("popup.navigation.manage.button.save")}
      </Button>
    ),
  };
};
