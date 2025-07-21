import { useEffect } from 'react';
import { UiFormSchema } from '../schemas';
import { ConfigSchema } from '../../../schemas';

const mapConfigDataToArray = (properties: Record<string, string[]>, contentTypes: string[]) => {
  const contentTypeProperties = contentTypes.map((key) => ({
    key,
    fields: properties[key] ?? [],
  }));

  const restProperties = Object.entries(properties)
    .filter(([key, _]) => !contentTypes.includes(key))
    .map(([key, fields]) => ({
      key,
      fields,
    }));

  return restProperties.concat(contentTypeProperties);
};

type UseInitialConfigParams = {
  config: ConfigSchema | undefined;
  setFormValue: (formValue: UiFormSchema) => void;
};

export const useInitialConfig = ({ config, setFormValue }: UseInitialConfigParams) => {
  useEffect(() => {
    if (config) {
      const {
        additionalFields,
        contentTypes,
        contentTypesNameFields,
        contentTypesPopulate,
        pathDefaultFields,
      } = config;
      setFormValue({
        ...config,
        additionalFields: additionalFields.filter((field: any) => typeof field !== 'string'),
        audienceFieldChecked: additionalFields.includes('audience'),
        contentTypesNameFields: mapConfigDataToArray(contentTypesNameFields, contentTypes),
        contentTypesPopulate: mapConfigDataToArray(contentTypesPopulate, contentTypes),
        pathDefaultFields: mapConfigDataToArray(pathDefaultFields, contentTypes),
      } as UiFormSchema);
    }
  }, [config]);
};
