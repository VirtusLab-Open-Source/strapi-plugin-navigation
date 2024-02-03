import { object, string, mixed, bool, array } from "yup";
import { translatedErrors } from "@strapi/helper-plugin";
import { getTradId } from "../../../translations";
import { NavigationItemCustomField, NavigationItemCustomFieldType } from "../../../../../types";
import { customFieldsTypes } from "../common";

export const schemaFactory = (usedCustomFieldNames: string[]) => {
  return object({
    name: string().matches(/^\S+$/, "Invalid name string. Name cannot contain spaces").required(translatedErrors.required).notOneOf(usedCustomFieldNames, translatedErrors.unique),
    label: string().required(translatedErrors.required),
    type: mixed().required(translatedErrors.required).oneOf(customFieldsTypes, getTradId("notification.error.customField.type")),
    required: bool().required(translatedErrors.required),
    multi: mixed().when(
      'type', {
      is: (val: NavigationItemCustomFieldType) => val === 'select',
      then: bool().required(translatedErrors.required),
      otherwise: bool().notRequired()
    }),
    options: mixed().when(
      'type', {
      is: (val: NavigationItemCustomFieldType) => val === 'select',
      then: array().of(string()),
      otherwise: mixed().notRequired(),
    }),
    enabled: bool().notRequired(),
  });
};

export const defaultValues: NavigationItemCustomField = {
  name: "",
  label: "",
  type: "string",
  required: false,
  multi: false,
  options: [],
  enabled: true,
};
