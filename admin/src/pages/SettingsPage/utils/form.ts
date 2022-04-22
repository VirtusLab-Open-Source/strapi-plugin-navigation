import { object, string, mixed } from "yup";

export const customFieldForm = {
  fieldsToDisable: [],
  fieldsToOmit: [],
  schema(usedCustomFieldNames: string[]) {
    return object({
      name: string().required().notOneOf(usedCustomFieldNames),
      label: string().required(),
      type: mixed().required().oneOf(['string', 'boolean']),
    });
  },
  inputsPrefix: '',
};
