import { useEffect, useMemo, useState } from 'react';
import { useLocale } from '.';

export interface MakeActionInput<T> {
  trigger(): void;
  cancel(): void;
  perform(input: T): void;
}

const makeAction = <T>({ cancel, perform, trigger }: MakeActionInput<T>) => {
  const pointer: { value?: T } = {};

  return {
    perform: (next?: T) => {
      const value = next ?? pointer.value;
      if (value) {
        perform(value);
      }
    },
    trigger: (next: T) => {
      pointer.value = next;
      trigger();
    },
    cancel,
  };
};

export const useLocales = (
  navigationsData: any,
  setStructureChanged: (structureChanged: boolean) => void
) => {
  const localeQuery = useLocale();

  const [currentLocale, setCurrentLocale] = useState<string>();
  const [isChangeLanguageVisible, setIsChangeLanguageVisible] = useState(false);

  const changeCurrentLocaleAction = useMemo(
    () =>
      makeAction<string>({
        perform: (next) => {
          setCurrentLocale(next);
          setIsChangeLanguageVisible(false);
          setStructureChanged(false);
        },
        trigger: () => setIsChangeLanguageVisible(true),
        cancel: () => setIsChangeLanguageVisible(false),
      }),
    [setCurrentLocale, setIsChangeLanguageVisible]
  );

  const availableLocales = useMemo(
    () =>
      (localeQuery.data
        ? [localeQuery.data.defaultLocale, ...localeQuery.data.restLocale]
        : []
      ).filter((locale) => locale !== currentLocale),
    [localeQuery.data, currentLocale]
  );

  useEffect(() => {
    if (!currentLocale && localeQuery.data?.defaultLocale) {
      setCurrentLocale(localeQuery.data?.defaultLocale);
      setStructureChanged(false);
    }
  }, [navigationsData, currentLocale, localeQuery.data?.defaultLocale]);

  return {
    localeData: localeQuery.data,
    currentLocale,
    isChangeLanguageVisible,
    changeCurrentLocaleAction,
    availableLocales,
  };
};
