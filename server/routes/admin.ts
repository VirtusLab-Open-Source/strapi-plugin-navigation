import { StrapiRoutes } from "../../types";
import pluginPermissions from "../../permissions";

const routes: StrapiRoutes = {
  type: 'admin',
  routes: [
    {
      method: 'GET',
      path: '/',
      handler: 'admin.get',
      config: {
        policies: [{
            name: "admin::hasPermissions",
            config: {
                actions: [pluginPermissions.render('read')],
            },
        }]
      }
    },
    {
      method: 'POST',
      path: '/',
      handler: 'admin.post',
      config: {
        policies: [{
            name: "admin::hasPermissions",
            config: {
                actions: [pluginPermissions.render('update')],
            },
        }]
      }
    },
    {
      method: 'GET',
      path: '/config',
      handler: 'admin.config',
      config: {
        policies: [{
            name: "admin::hasPermissions",
            config: {
                actions: [pluginPermissions.render('read')],
            },
        }]
      }
    },
    {
      method: 'PUT',
      path: '/config',
      handler: 'admin.updateConfig',
      config: {
        policies: [{
            name: "admin::hasPermissions",
            config: {
                actions: [pluginPermissions.render('settings')],
            },
        }]
      }
    },
    {
      method: 'DELETE',
      path: '/config',
      handler: 'admin.restoreConfig',
      config: {
        policies: [{
            name: "admin::hasPermissions",
            config: {
                actions: [pluginPermissions.render('settings')],
            },
        }]
      }
    },
    {
      method: 'GET',
      path: '/slug',
      handler: 'admin.getSlug',
      config: {
        policies: [
          'admin::isAuthenticatedAdmin'
        ]
      }
    },
    {
      method: 'GET',
      path: '/:id',
      handler: 'admin.getById',
      config: {
        policies: [{
            name: "admin::hasPermissions",
            config: {
                actions: [pluginPermissions.render('read')],
            },
        }]
      }
    },
    {
      method: 'PUT',
      path: '/:id',
      handler: 'admin.put',
      config: {
        policies: [{
            name: "admin::hasPermissions",
            config: {
                actions: [pluginPermissions.render('update')],
            },
        }]
      }
    },
    {
      method: 'DELETE',
      path: '/:id',
      handler: 'admin.delete',
      config: {
        policies: [{
            name: "admin::hasPermissions",
            config: {
                actions: [pluginPermissions.render('update')],
            },
        }]
      }
    },
    {
      method: 'GET',
      path: '/content-type-items/:model',
      handler: 'admin.getContentTypeItems',
      config: {
        policies: [
          'admin::isAuthenticatedAdmin'
        ]
      }
    },
    {
      method: 'GET',
      path: '/settings/config',
      handler: 'admin.settingsConfig',
      config: {
        policies: [{
            name: "admin::hasPermissions",
            config: {
                actions: [pluginPermissions.render('settings')],
            },
        }]
      }
    },
    {
      method: 'GET',
      path: '/settings/restart',
      handler: 'admin.settingsRestart',
      config: {
        policies: [{
            name: "admin::hasPermissions",
            config: {
                actions: [pluginPermissions.render('settings')],
            },
        }]
      }
    },
    {
      method: 'PUT',
      path: '/i18n/copy/:source/:target',
      handler: 'admin.fillFromOtherLocale',
      config: {
        policies: [{
            name: "admin::hasPermissions",
            config: {
                actions: [pluginPermissions.render('update')],
            },
        }]
      }
    },
    {
      method: 'GET',
      path: '/i18n/item/read/:source/:target',
      handler: 'admin.readNavigationItemFromLocale',
      config: {
        policies: [{
            name: "admin::hasPermissions",
            config: {
                actions: [pluginPermissions.render('read')],
            },
        }]
      }
    },
  ]
}

export default routes;
