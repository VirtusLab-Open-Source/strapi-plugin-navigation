import { MessageDescriptor } from "react-intl";
import { NavigationItemCustomField } from "../../../../types";

export type AdditionalFieldInputProps = {
  field: NavigationItemCustomField;
  isLoading: boolean;
  onChange: (name: string, value: string) => void;
  value: string | boolean | string[] | null;
  error: MessageDescriptor | null;
}
export type TargetProp = "value" | "checked";
export type Input = {
  prop: TargetProp;
} & Pick<AdditionalFieldInputProps, "onChange" | "field">;
