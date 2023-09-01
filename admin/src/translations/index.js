import pluginId from "../pluginId";
import en from "./en.json";
import fr from "./fr.json";
import ca from "./ca.json";

const trads = {
	en,
	fr,
	ca,
};

export const getTradId = (msg) => `${pluginId}.${msg}`;
export const getTrad = (msg, defaultMessage) => ({id: getTradId(msg), defaultMessage: defaultMessage || getTradId(msg)});

export default trads;
