import * as yup from "yup";
import { isNil } from "lodash";
import { translatedErrors } from "@strapi/helper-plugin";
import { navigationItemType } from "../../../utils/enums";
import pluginId from "../../../../../pluginId";

export const form = {
  fieldsToDisable: [],
  fieldsToOmit: [],
  schema(isSingleSelected) {
    return yup.object({
      title: yup.string()
        .when('type', {
          is: val => val === navigationItemType.EXTERNAL,
          then: yup.string()
            .required(translatedErrors.required),
          otherwise: yup.string().notRequired(),
        }),
      uiRouterKey: yup.string().required(translatedErrors.required),
      type: yup.string().required(translatedErrors.required),
      path: yup.string()
        .when('type', {
          is: val => val === navigationItemType.INTERNAL || isNil(val),
          then: yup.string().required(translatedErrors.required),
          otherwise: yup.string().notRequired(),
        }),
      externalPath: yup.string()
        .when('type', {
          is: val => val === navigationItemType.EXTERNAL,
          then: yup.string()
            .required(translatedErrors.required)
            .matches(/(#.*)|(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/, { 
              excludeEmptyString: true,
              message: `${pluginId}.popup.item.form.externalPath.validation.type`,
            }),
          otherwise: yup.string().notRequired(),
        }),
      menuAttached: yup.boolean(),
      relatedType: yup.mixed()
        .when('type', {
          is: val => val === navigationItemType.INTERNAL || isNil(val),
          then: isSingleSelected ? yup.mixed().notRequired() : yup.mixed().required(translatedErrors.required),
          otherwise: yup.mixed().notRequired(),
        }),
      related: yup.mixed()
        .when('type', {
          is: val => val === navigationItemType.INTERNAL || isNil(val),
          then: isSingleSelected ? yup.mixed().notRequired() : yup.mixed().required(translatedErrors.required),
          otherwise: yup.mixed().notRequired(),
        }),
    });
  },
  inputsPrefix: '',
};
