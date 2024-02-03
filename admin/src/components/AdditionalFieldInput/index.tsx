import React, { BaseSyntheticEvent, useEffect, useMemo } from "react";
import { ToBeFixed, assertBoolean, assertString } from "../../../../types";
//@ts-ignore
import { ToggleInput } from "@strapi/design-system/ToggleInput";
//@ts-ignore
import { TextInput } from "@strapi/design-system/TextInput";
//@ts-ignore
import { Select, Option } from "@strapi/design-system/Select";
//@ts-ignore
import { useNotification, useLibrary } from "@strapi/helper-plugin";
import { getTrad } from "../../translations";
import { AdditionalFieldInputProps, Input } from "./types";
import { isNil } from "lodash";
import { useIntl } from "react-intl";

const DEFAULT_STRING_VALUE = "";
const handlerFactory =
  ({ field, prop, onChange }: Input) =>
  ({ target }: BaseSyntheticEvent) => {
    onChange(field.name, target[prop], field.type);
  };

const mediaAttribute = {
  type: "media",
  multiple: false,
  required: false,
  allowedTypes: ["images"],
  pluginOptions: {
    i18n: {
      localized: false,
    },
  },
};

const AdditionalFieldInput: React.FC<AdditionalFieldInputProps> = ({
  field,
  isLoading,
  onChange,
  value: baseValue,
  disabled,
  error,
}) => {
  const { fields } = useLibrary();
  const value = useMemo(
    () =>
      field.type === "media" && baseValue
        ? JSON.parse(baseValue as string)
        : baseValue,
    [baseValue, field.type]
  );
  const toggleNotification = useNotification();
  const { formatMessage } = useIntl();
  const defaultInputProps = useMemo(
    () => ({
      id: field.name,
      name: field.name,
      label: field.label,
      disabled: isLoading || disabled,
      error: error && formatMessage(error),
    }),
    [field, isLoading, error]
  );
  const handleBoolean = useMemo(
    () => handlerFactory({ field, onChange, prop: "checked" }),
    [onChange, field]
  );
  const handleString = useMemo(
    () => handlerFactory({ field, onChange, prop: "value" }),
    [onChange, field]
  );
  const handleMedia = useMemo(
    () => handlerFactory({ field, onChange, prop: "value" }),
    [onChange, field]
  );
  const MediaInput = (fields?.media ??
    (() => <></>)) as React.ComponentType<ToBeFixed>;

  useEffect(() => {
    if (!MediaInput) {
      toggleNotification({
        type: "warning",
        message: getTrad("notification.error.customField.media.missing"),
      });
    }
  }, []);

  switch (field.type) {
    case "boolean":
      if (!isNil(value)) assertBoolean(value);
      return (
        <ToggleInput
          {...defaultInputProps}
          checked={!!value}
          onChange={handleBoolean}
          onLabel="true"
          offLabel="false"
        />
      );
    case "string":
      if (!isNil(value)) assertString(value);
      return (
        <TextInput
          {...defaultInputProps}
          onChange={handleString}
          value={value || DEFAULT_STRING_VALUE}
        />
      );
    case "select":
      return (
        <Select
          {...defaultInputProps}
          onChange={(v: string) => onChange(field.name, v, "select")}
          value={isNil(value) ? (field.multi ? [] : null) : value}
          multi={field.multi}
          withTags={field.multi}
        >
          {field.options.map((option, index) => (
            <Option key={`${field.name}-option-${index}`} value={option}>
              {option}
            </Option>
          ))}
        </Select>
      );
    case "media":
      return (
        <MediaInput
          {...defaultInputProps}
          id="navigation-item-media"
          onChange={handleMedia}
          value={value || []}
          intlLabel={defaultInputProps.label}
          attribute={mediaAttribute}
        />
      );
    default:
      toggleNotification({
        type: "warning",
        message: getTrad("notification.error.customField.type"),
      });
      throw new Error(`Type of custom field is unsupported`);
  }
};

export default AdditionalFieldInput;
