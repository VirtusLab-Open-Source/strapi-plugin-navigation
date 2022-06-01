// @ts-ignore
import { Grid, GridItem } from "@strapi/design-system/Grid";
// @ts-ignore
import { Form as BaseForm, GenericInput } from "@strapi/helper-plugin";
// @ts-ignore
import { Formik } from "formik";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import * as yup from "yup";
import { Effect } from "../../../../../../../types";
import { getTradId } from "../../../../../translations";
import { Navigation } from "../types";
import { get } from "lodash";

interface Props {
  navigation: Partial<Navigation>;
  onChange: Effect<Navigation>;
  isLoading?: boolean;
  validationSchema: ReturnType<typeof validationSchemaFactory>;
}

export const Form = ({
  navigation,
  onChange: onChangeBase,
  isLoading,
  validationSchema,
}: Props) => {
  const initialValues: Navigation= {
    id: get(navigation, "id", ""),
    name: get(navigation, "name", ""),
  }
  const onChange = useCallback(
    ({ target: { name, value } }: React.ChangeEvent<HTMLInputElement>) => {
      onChangeBase({
        ...navigation,
        [name]: value,
      } as Navigation);
    },
    [onChangeBase, navigation]
  );

  const [error, setError] = useState<yup.ValidationError | null>(null);

  const errorProps = useMemo(
    () => ({
      name: error?.path === "name" ? error.message : undefined,
      visible: error?.path === "visible" ? error.message : undefined,
    }),
    [error]
  );

  useEffect(() => {
    validationSchema
      .validate(navigation)
      .then(() => setError(null))
      .catch(setError);
  }, [navigation, validationSchema, setError]);

  return (
    <Formik initialValues={initialValues} onSubmit={onChangeBase}>
      <BaseForm>
        <Grid gap={5}>
          <GridItem col={6}>
            <GenericInput
              {...formProps.name}
              name="name"
              description={{
                id: getTradId("popup.item.form.title.placeholder"),
                defaultMessage: "e.g. Blog",
              }}
              type="text"
              error={errorProps.name}
              onChange={onChange}
              value={navigation.name}
              disabled={isLoading}
              required
            />
          </GridItem>
          <GridItem col={6}>
            <GenericInput
              {...formProps.visible}
              name="visible"
              type="bool"
              error={errorProps.visible}
              onChange={onChange}
              value={navigation.visible}
              disabled={isLoading}
            />
          </GridItem>
        </Grid>
      </BaseForm>
    </Formik> //
  );
};

const formProps = {
  name: {
    intlLabel: {
      id: getTradId("popup.navigation.form.name.label"),
      defaultMessage: "Name",
    },
    placeholder: {
      id: getTradId("popup.navigation.form.name.placeholder"),
      defaultMessage: "Navigations's name",
    },
  },
  visible: {
    intlLabel: {
      id: getTradId("popup.navigation.form.visible.label"),
      defaultMessage: "Visibility",
    },
  },
};

export const validationSchemaFactory = (
  alreadyUsedNames: Array<string>,
  formatMessage: ReturnType<typeof useIntl>["formatMessage"]
) =>
  yup.object({
    name: yup
      .string()
      .notOneOf(
        alreadyUsedNames,
        formatMessage({
          id: getTradId("popup.navigation.form.validation.name.alreadyUsed"),
        })
      )
      .required(
        formatMessage({
          id: getTradId("popup.navigation.form.validation.name.required"),
        })
      )
      .min(
        2,
        formatMessage({
          id: getTradId("popup.navigation.form.validation.name.tooShort"),
        })
      ),
    visible: yup.boolean().required(
      formatMessage({
        id: getTradId("popup.navigation.form.validation.visible.required"),
      })
    ),
  });
