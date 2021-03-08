import pluginId from "../pluginId";
import en from "./en.json";

const trads = {
  en,
};

export const getTradId = (msg) => `${pluginId}.${msg}`;
export const getTrad = (msg) => ({id: getTradId(msg)});

export default trads;
