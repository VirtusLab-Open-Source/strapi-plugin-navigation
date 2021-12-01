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
    }
  ]
}
