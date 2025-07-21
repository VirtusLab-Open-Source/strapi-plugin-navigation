import { createContext, useContext } from 'react';
import { FormChangeEvent } from '../../../types';
import { RestartStatus } from '../types';
import { UiFormSchema } from '../schemas';

export type SettingsContextType = {
  values: UiFormSchema;
  onChange: (eventOrPath: React.ChangeEvent<any> | string, value?: any) => void;
  handleChange: (
    eventOrPath: FormChangeEvent,
    value?: any,
    nativeOnChange?: (eventOrPath: FormChangeEvent, value?: any) => void
  ) => void;
  restartStatus: RestartStatus;
  setRestartStatus: (restartStatus: RestartStatus) => void;
  renderError: (error: string) => string | undefined;
  setFormValueItem: (path: string, value: any) => void;
};

export const SettingsContext = createContext<SettingsContextType>({
  values: {} as UiFormSchema,
  onChange: () => null,
  handleChange: () => null,
  restartStatus: { required: false },
  setRestartStatus: () => null,
  renderError: () => '',
  setFormValueItem: () => null,
});

export const useSettingsContext = () => useContext(SettingsContext);
