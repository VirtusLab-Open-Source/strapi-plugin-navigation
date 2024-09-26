import { Initializer } from './components/Initializer';
import { PluginIcon } from './components/icons/pluginIcon';
import App from './pages/App';
import SettingsPage from './pages/SettingsPage';
import { PLUGIN_ID } from './pluginId';
import pluginPermissions from './utils/permissions';
import { flattenObject, prefixPluginTranslations } from '@sensinum/strapi-utils';
import trads from "./translations";

const name = "navigation";
const displayName = "Navigation";

export default {
  register(app: any) {
    app.createSettingSection(
      {
        id: PLUGIN_ID,
        intlLabel: {
          id: `${PLUGIN_ID}.plugin.section.name`,
          defaultMessage: `${displayName} plugin`,
        },
      },
      [
        {
          intlLabel: {
            id: `${PLUGIN_ID}.plugin.section.item`,
            defaultMessage: "Configuration",
          },
          id: 'navigation',
          to: PLUGIN_ID,
          Component() {
            return SettingsPage;
          },
          permissions: pluginPermissions.settings,
        },
      ]
    );

    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: displayName,
      },
      Component() {
        return App;
      },
      permissions: pluginPermissions.access,
      position: 1,
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name,
    });
  },


  registerTrads: async function ({ locales = [] }: { locales: string[] }) {
    return Promise.all(
      locales.map(async (locale: string) => {
        if (locale in trads) {
          const typedLocale = locale as keyof typeof trads;
          return trads[typedLocale]().then(({ default: trad }) => {
            return {
              data: prefixPluginTranslations(flattenObject(trad), PLUGIN_ID),
              locale,
            };
          });
        }
        return {
          data: prefixPluginTranslations(flattenObject({}), PLUGIN_ID),
          locale,
        };
      }),
    );
  },
};
