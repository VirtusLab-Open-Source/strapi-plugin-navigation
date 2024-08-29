import { PLUGIN_ID } from '../pluginId';
import ca from './ca.json';
import en from './en.json';
import fr from './fr.json';

const trads = {
  en,
  fr,
  ca,
};

export const getTradId = (msg: string) => `${PLUGIN_ID}.${msg}`;
export const getTrad = (msg: string, defaultMessage?: string) => ({
  id: getTradId(msg),
  defaultMessage: defaultMessage ?? getTradId(msg),
});

export default trads;
