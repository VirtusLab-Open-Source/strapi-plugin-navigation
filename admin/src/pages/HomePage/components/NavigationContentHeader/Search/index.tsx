import { IconButton, Searchbar, Typography } from '@strapi/design-system';
import { Search as SearchIcon } from '@strapi/icons';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';

import { getTrad } from '../../../../../translations';
import { Effect } from '../../../../../types';

interface Props {
  value: string;
  setValue: Effect<{ value: string; index: number }>;
  initialIndex?: number;
}

const DEFAULT_INDEX = 0;

export const Search = ({ value, setValue, initialIndex = DEFAULT_INDEX }: Props) => {
  const [currentValue, setCurrentValue] = useState(value);
  const [previousValue, setPreviousValue] = useState(value);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isOpen, setIsOpen] = useState(!!value);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { formatMessage } = useIntl();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        wrapperRef.current?.querySelector('input')?.focus();
      }, 0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (currentIndex && currentValue === previousValue) {
      setValue({
        value: currentValue,
        index: currentIndex,
      });
    }
  }, [currentIndex, currentValue, previousValue]);

  useEffect(() => {
    if (currentValue !== previousValue) {
      setPreviousValue(currentValue);
      setCurrentIndex(DEFAULT_INDEX);
      setValue({
        value: currentValue,
        index: DEFAULT_INDEX,
      });
    }
  }, [currentValue, previousValue]);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code.toLowerCase() === 'enter') {
      setCurrentIndex((current) => current + 1);
    }
  }, []);
  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setCurrentValue(e.target.value);
    },
    [setCurrentValue]
  );
  const onClear = useCallback(() => {
    setCurrentValue('');
    setIsOpen(false);
  }, [setCurrentValue, setIsOpen]);

  if (isOpen) {
    return (
      <div ref={wrapperRef}>
        <Searchbar
          name="searchbar"
          onClear={onClear}
          value={value}
          size="S"
          onChange={onChange}
          clearLabel="Clearing the search"
          placeholder={formatMessage(
            getTrad('pages.main.search.placeholder', 'Type to start searching...')
          )}
          onKeyDown={onKeyDown}
        >
          Search for navigation items
        </Searchbar>
        <Typography
          variant="pi"
          fontColor="neutral150"
          style={{ margin: '3px 0 0', display: 'inline-block' }}
        >
          {formatMessage(
            getTrad('pages.main.search.subLabel', 'press ENTER to highlight next item')
          )}
        </Typography>
      </div>
    );
  } else {
    return <IconButton children={<SearchIcon />} onClick={() => setIsOpen(!isOpen)} />;
  }
};
