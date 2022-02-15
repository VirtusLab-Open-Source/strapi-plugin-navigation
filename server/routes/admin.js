module.exports = {
  type: 'admin',
  routes: [
    {
      method: 'GET',
      path: '/',
      handler: 'navigation.get',
    },
    {
      method: 'POST',
      path: '/',
      handler: 'navigation.post',
    },
    {
      method: 'GET',
      path: '/config',
      handler: 'navigation.config',
    },
    {
      method: 'PUT',
      path: '/config',
      handler: 'navigation.updateConfig',
    },
    {
      method: 'DELETE',
      path: '/config',
      handler: 'navigation.restoreConfig',
    },
    {
      method: 'GET',
      path: '/:id',
      handler: 'navigation.getById',
    },
    {
      method: 'PUT',
      path: '/:id',
      handler: 'navigation.put',
    },
    {
      method: 'GET',
      path: '/content-type-items/:model',
      handler: 'navigation.getContentTypeItems',
      policies: [
        'admin::isAuthenticatedAdmin'
      ]
    },
    {
      method: 'GET',
      path: '/settings/config',
      handler: 'navigation.settingsConfig',
    },
    {
      method: 'GET',
      path: '/settings/restart',
      handler: 'navigation.settingsRestart',
      config: {
        policies: [],
      },
    },
  ]
}
