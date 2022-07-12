import { object, string, mixed, bool, array } from "yup";
//@ts-ignore
import { translatedErrors } from "@strapi/helper-plugin";
import { getTradId } from "../../../translations";
import { NavigationItemCustomField, NavigationItemCustomFieldType } from "../../../../../types";

export const schemaFactory = (usedCustomFieldNames: string[]) => {
  return object({
    name: string().required(translatedErrors.required).notOneOf(usedCustomFieldNames, translatedErrors.unique),
    label: string().required(translatedErrors.required),
    type: mixed().required(translatedErrors.required).oneOf(['string', 'boolean', 'select'], getTradId("notification.error.customField.type")),
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
    })
  });
};

export const defaultValues: NavigationItemCustomField = {
  name: "",
  label: "",
  type: "string",
  required: false,
  multi: false,
  options: [],
};
