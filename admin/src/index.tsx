import { Initializer } from './components/Initializer';
import { NavigationIcon } from './components/icons';
import App from './pages/App';
import SettingsPage from './pages/SettingsPage';
import { PLUGIN_ID } from './pluginId';
import trads, { getTrad } from './translations';
import pluginPermissions from './utils/permissions';
import { prefixPluginTranslations } from './utils/prefixPluginTranslations';

export default {
  register(app: any) {
    app.createSettingSection(
      {
        id: PLUGIN_ID,
        intlLabel: getTrad('pages.settings.section.title', 'Navigation Plugin'),
      },
      [
        {
          intlLabel: getTrad('pages.settings.section.subtitle', 'Configuration'),
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
      icon: () => <NavigationIcon />,
      intlLabel: getTrad('plugin.name', 'Navigation'),
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
      name: PLUGIN_ID,
    });
  },

  registerTrads() {
    return Object.entries(trads).map(([locale, translations]) => ({
      locale,
      data: prefixPluginTranslations(translations, PLUGIN_ID),
    }));
  },
};
