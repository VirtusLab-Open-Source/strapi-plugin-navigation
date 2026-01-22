import { createContext, useContext } from 'react';
import { FormChangeEvent } from '../../../../../types';
import { type NavigationItemFormSchema } from '../utils/form';

export type NavigationItemFormContextType = {
  values: NavigationItemFormSchema;
  onChange: (eventOrPath: React.ChangeEvent<any> | string, value?: any) => void;
  handleChange: (
    eventOrPath: FormChangeEvent,
    value?: any,
    nativeOnChange?: (eventOrPath: FormChangeEvent, value?: any) => void
  ) => void;
  renderError: (field: string, messageKey?: string) => string | undefined;
  setFormValueItem: (path: string, value: any) => void;
  canUpdate: boolean | undefined;
  isLoading: boolean;
};

export const NavigationItemFormContext = createContext<NavigationItemFormContextType>({
  values: {} as NavigationItemFormSchema,
  onChange: () => null,
  handleChange: () => null,
  renderError: () => '',
  setFormValueItem: () => null,
  canUpdate: undefined,
  isLoading: true,
});

export const useNavigationItemFormContext = () => useContext(NavigationItemFormContext);
