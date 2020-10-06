import pluginPkg from "../../package.json";
import pluginId from "./pluginId";
import App from "./containers/App";
import Initializer from "./containers/Initializer";
import lifecycles from "./lifecycles";
import trads from "./translations";
import pluginPermissions from "./permissions";

export default (strapi) => {
  const pluginDescription =
    pluginPkg.strapi.description || pluginPkg.description;
  const { icon, name } = pluginPkg.strapi;

  const plugin = {
    blockerComponent: null,
    blockerComponentProps: {},
    description: pluginDescription,
    icon,
    id: pluginId,
    initializer: Initializer,
    injectedComponents: [],
    isReady: false,
    isRequired: pluginPkg.strapi.required || false,
    layout: null,
    lifecycles,
    leftMenuLinks: [],
    leftMenuSections: [],
    mainComponent: App,
    name,
    preventComponentRendering: false,
    trads,
    menu: {
      pluginsSectionLinks: [
        {
          destination: `/plugins/${pluginId}`,
          icon,
          name,
          label: {
            id: `${pluginId}.plugin.name`,
            defaultMessage: "NAVIGATION",
          },
          permissions: pluginPermissions.main,
        },
      ],
    },
  };

  return strapi.registerPlugin(plugin);
};
