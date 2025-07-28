import { isEmpty } from 'lodash';
import { useState } from 'react';
import { NavigationItemSchema, NavigationSchema } from '../../../api/validators';

const filteredListFactory = (
  items: Array<NavigationItemSchema>,
  doUse: (item: NavigationItemSchema) => boolean,
  activeIndex?: number
): NavigationItemSchema[] => {
  const filteredItems = items.reduce<Array<NavigationItemSchema>>((acc, item) => {
    const subItems = !!item.items?.length ? filteredListFactory(item.items ?? [], doUse) : [];

    if (doUse(item)) {
      return [item, ...subItems, ...acc];
    } else {
      return [...subItems, ...acc];
    }
  }, []);

  if (activeIndex !== undefined) {
    const index = activeIndex % filteredItems.length;

    return filteredItems.map((item, currentIndex) => {
      return index === currentIndex ? { ...item, isSearchActive: true } : item;
    });
  }

  return filteredItems;
};

export const useSearch = (currentNavigation: NavigationSchema | undefined) => {
  const [{ value: searchValue, index: searchIndex }, setSearchValue] = useState({
    value: '',
    index: 0,
  });
  const isSearchEmpty = isEmpty(searchValue);
  const normalisedSearchValue = (searchValue || '').toLowerCase();

  const filteredList = !isSearchEmpty
    ? filteredListFactory(
        currentNavigation?.items.map((_) => ({ ..._ })) ?? [],
        (item) => (item?.title || '').toLowerCase().includes(normalisedSearchValue),
        normalisedSearchValue ? searchIndex : undefined
      )
    : [];

  return {
    searchValue,
    setSearchValue,
    isSearchEmpty,
    filteredList,
  };
};
