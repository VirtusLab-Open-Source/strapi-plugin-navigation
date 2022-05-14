import { object, string, mixed } from "yup";
//@ts-ignore
import { translatedErrors } from "@strapi/helper-plugin";
import { getTradId } from "../../../translations";
import { NavigationItemCustomField } from "../../../../../types";

export const schemaFactory = (usedCustomFieldNames: string[]) => {
  return object({
    name: string().required(translatedErrors.required).notOneOf(usedCustomFieldNames, translatedErrors.unique),
    label: string().required(translatedErrors.required),
    type: mixed().required(translatedErrors.required).oneOf(['string', 'boolean'], getTradId("notification.error.customField.type")),
  });
};

export const defaultValues: NavigationItemCustomField = {
  name: "",
  label: "",
  type: "string",
};
