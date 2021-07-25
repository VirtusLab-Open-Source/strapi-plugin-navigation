import pluginId from "../pluginId";
import en from "./en.json";
import fr from "./fr.json";

const trads = {
	en,
	fr,
};

export const getTradId = (msg) => `${pluginId}.${msg}`;
export const getTrad = (msg) => ({id: getTradId(msg)});

export default trads;
