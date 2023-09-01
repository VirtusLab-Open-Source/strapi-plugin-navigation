import { prefixPluginTranslations } from '@strapi/helper-plugin';
import pluginPkg from '../../package.json';
import pluginId from './pluginId';
import pluginPermissions from './permissions';
import NavigationIcon from './components/icons/navigation';
import trads, { getTrad } from './translations';
import { get } from 'lodash';
const name = pluginPkg.strapi.name;

export default {
  register(app) {
    app.createSettingSection(
      {
        id: pluginId,
        intlLabel: { id: getTrad('pages.settings.section.title'), defaultMessage: 'Navigation Plugin' },
      },
      [
        {
          intlLabel: {
            id: getTrad('pages.settings.section.subtitle'),
            defaultMessage: 'Configuration',
          },
          id: 'navigation',
          to: `/settings/${pluginId}`,
          Component: async () => {
            const component = await import(
              /* webpackChunkName: "navigation-settings" */ './pages/SettingsPage'
            );
    
            return component;
          },
          permissions: pluginPermissions.settings,
        }
      ]);
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: NavigationIcon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: 'Navigation',
      },
      Component: async () => {
        const component = await import(/* webpackChunkName: "navigation-main-app" */ './pages/App');

        return component;
      },
      permissions: pluginPermissions.access,
    });
    app.registerPlugin({
      id: pluginId,
      name,
    });
  },
  bootstrap() {},
  registerTrads({ locales = [] }) {
    return locales.map((locale) => {
      return {
        data: prefixPluginTranslations(get(trads, locale), pluginId, {}),
        locale,
      };
    });
  },
};
