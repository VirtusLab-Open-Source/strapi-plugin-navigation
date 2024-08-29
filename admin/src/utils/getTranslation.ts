import { PLUGIN_ID } from '../pluginId';

export { getTrad, getTradId } from '../translations';

const getTranslation = (id: string) => `${PLUGIN_ID}.${id}`;

export { getTranslation };
