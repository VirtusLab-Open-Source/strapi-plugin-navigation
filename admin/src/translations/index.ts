import { KeyValueSet } from "strapi-typed";
import en from "./en.json";
import fr from "./fr.json";

export type TranslationKey = "en" | "fr";
export type Translations = {
  [key in TranslationKey]: KeyValueSet<string>
};

const trads: Translations = {
	en,
	fr,
  };
  
  export default trads;
