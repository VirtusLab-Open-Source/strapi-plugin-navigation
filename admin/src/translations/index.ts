import { Path } from '@sensinum/strapi-utils';
import type { EN } from './en';
import { PLUGIN_ID } from '../pluginId';

export type TranslationPath = Path<EN>;

const trads = {
  en: () => import('./en'),
  fr: () => import('./fr'),
  ca: () => import('./ca'),
};

export const getTradId = (msg: string) => `${PLUGIN_ID}.${msg}`;
export const getTrad = (msg: string, defaultMessage?: string) => ({
  id: getTradId(msg),
  defaultMessage: defaultMessage ?? getTradId(msg),
});

export default trads;
