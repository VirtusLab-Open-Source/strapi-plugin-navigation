import { StrapiContext } from "strapi-typed";
import { buildAllHookListeners } from "../../utils";

export default buildAllHookListeners("navigation-item", {
  strapi,
} as unknown as StrapiContext);
