import { prefixPluginTranslations } from '@strapi/helper-plugin';
import pluginPkg from '../../package.json';
import pluginId from './pluginId';
import pluginPermissions from './permissions';
import NavigationIcon from './components/icons/navigation';

const name = pluginPkg.strapi.name;

export default {
  register(app) {
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: NavigationIcon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: 'Navigation',
      },
      Component: async () => {
        const component = await import(/* webpackChunkName: "my-plugin" */ './pages/App');

        return component;
      },
      permissions: pluginPermissions.access,
    });
    app.registerPlugin({
      id: pluginId,
      name,
    });
  },
  bootstrap(app) { 
    app.addSettingsLink('global', {
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: 'Navigation',
      },
      id: 'navigation',
      to: `/settings/${pluginId}`,
      Component: async () => {
        const component = await import(
          /* webpackChunkName: "documentation-settings" */ './pages/SettingsPage'
        );

        return component;
      },
      permissions: pluginPermissions.access,
    });
  },
  async registerTrads({ locales }) {
    const importedTrads = await Promise.all(
      locales.map(locale => {
        return import(
          /* webpackChunkName: "[pluginId]-[request]" */ `./translations/${locale}.json`
        )
          .then(({ default: data }) => {
            return {
              data: prefixPluginTranslations(data, pluginId),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      })
    );

    return Promise.resolve(importedTrads);
  },
};
