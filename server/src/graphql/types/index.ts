import contentTypes from './content-types';
import contentTypesNameFields from './content-types-name-fields';
import createNavigations from './create-navigation';
import createNavigationItem from './create-navigation-item';
import createNavigationRelated from './create-navigation-related';
import navigation from './navigation';
import navigationConfig from './navigation-config';
import navigationDetails from './navigation-details';
import navigationItem from './navigation-item';
import navigationItemAdditionalField from './navigation-item-additional-field-media';
import navigationItemRelated from './navigation-item-related';
import navigationItemRelatedData from './navigation-item-related-data';
import renderType from './navigation-render-type';

const typesFactories = [
  navigationItemAdditionalField,
  navigationItemRelated,
  navigationItemRelatedData,
  navigationItem,
  renderType,
  navigation,
  navigationDetails,
  contentTypesNameFields,
  contentTypes,
  navigationConfig,
  createNavigationRelated,
  createNavigationItem,
  createNavigations,
];

export const getTypes = (context: any) => {
  return typesFactories.map((factory) => factory(context));
}