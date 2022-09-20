import * as yup from "yup";
import { isNil } from "lodash";
//@ts-ignore
import { translatedErrors } from "@strapi/helper-plugin";
import { navigationItemType } from "../../../../../utils";
import { NavigationItemAdditionalField, NavigationItemType } from "../../../../../../../types";
import { RawFormPayload } from "../types";
import pluginId from "../../../../../pluginId";

const externalPathRegexps = [
  /^mailto:[\w-\.]+@([\w-]+\.)+[\w-]{2,}$/,
  /^tel:(\+\d{1,3})?[\s]?(\(?\d{2,3}\)?)?[\s.-]?(\d{3})?[\s.-]?\d{3,4}$/,
  /^#.*/,
  /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/,
];

export const schemaFactory = (isSingleSelected: boolean, additionalFields: NavigationItemAdditionalField[]) => {
  return yup.object({
    title: yup.string()
      .when('type', {
        is: (val: NavigationItemType) => val !== navigationItemType.INTERNAL,
        then: yup.string()
          .required(translatedErrors.required),
        otherwise: yup.string().notRequired(),
      }),
    uiRouterKey: yup.string().required(translatedErrors.required),
    type: yup.string().required(translatedErrors.required),
    path: yup.string()
      .when('type', {
        is: (val: NavigationItemType) => val !== navigationItemType.EXTERNAL || isNil(val),
        then: yup.string().matches(/^\S+$/, "Invalid path string").required(translatedErrors.required),
        otherwise: yup.string().notRequired(),
      }),
    externalPath: yup.string()
      .when('type', {
        is: (val: NavigationItemType) => val === navigationItemType.EXTERNAL,
        then: yup.string()
          .required(translatedErrors.required)
          .test(
            `${pluginId}.popup.item.form.externalPath.validation.type`,
            externalPath =>
              externalPath ? externalPathRegexps.some(re => re.test(externalPath)) : true
          ),
        otherwise: yup.string().notRequired(),
      }),
    menuAttached: yup.boolean(),
    relatedType: yup.mixed()
      .when('type', {
        is: (val: NavigationItemType) => val === navigationItemType.INTERNAL || isNil(val),
        then: yup.string().required(translatedErrors.required).min(1, translatedErrors.required),
        otherwise: yup.mixed().notRequired(),
      }),
    related: yup.mixed()
      .when('type', {
        is: (val: NavigationItemType) => val === navigationItemType.INTERNAL || isNil(val),
        then: isSingleSelected ? yup.mixed().notRequired() : yup.string().required(translatedErrors.required).min(1, translatedErrors.required),
        otherwise: yup.mixed().notRequired(),
      }),
    additionalFields: yup.object({
      ...additionalFields.reduce((acc, current) => {
        var value;
        if (typeof current === 'string')
          return acc;

        if (current.type === 'boolean')
          value = yup.bool();
        else if (current.type === 'string')
          value = yup.string();
        else if (current.type === 'select' && current.multi)
          value = yup.array().of(yup.string());
        else if (current.type === 'select' && !current.multi)
          value = yup.string();
        else
          throw new Error(`Type "${current.type}" is unsupported by custom fields`);

        if (current.required)
          value = value.required(translatedErrors.required);
        else
          value = value.notRequired();

        return { ...acc, [current.name]: value }
      }, {})
    })
  });
};

export const defaultValues: RawFormPayload = {
  type: "INTERNAL",
  related: "",
  relatedType: "",
  audience: [],
  menuAttached: false,
  title: "",
  externalPath: "",
  path: "",
  additionalFields: {
    boolean: false,
    string: "",
  },
  updated: false,
}
