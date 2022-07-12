import React, { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import { Effect } from "../../../../../../../types";
import { getMessage } from "../../../../../utils";
import { Footer, FooterBase } from "../Footer";
import { Form, validationSchemaFactory } from "../Form";
import { CommonProps, EditState, Navigation } from "../types";

interface Props extends EditState, CommonProps {}

export const NavigationUpdate = ({
  alreadyUsedNames,
  current,
  isLoading,
  navigation: initialValue,
  setState,
}: Props) => {
  const { formatMessage } = useIntl();

  const onChange: Effect<Navigation> = useCallback(
    (updated) => {
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

export const NavigationUpdateFooter: Footer = ({
  state,
  onSubmit,
  onReset,
}) => (
  <FooterBase
    start={{
      children: getMessage("popup.item.form.button.cancel"),
      disabled: state.isLoading,
      onClick: onReset,
      variant: "tertiary",
    }}
    end={{
      children: getMessage("popup.navigation.manage.button.save"),
      disabled: state.isLoading,
      onClick: onSubmit,
      variant: "secondary",
    }}
  />
);
