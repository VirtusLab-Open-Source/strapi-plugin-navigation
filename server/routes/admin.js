module.exports = {
  type: 'admin',
  routes: [
    {
      method: 'GET',
      path: '/',
      handler: 'navigation.get',
    },
    {
      method: 'GET',
      path: '/config',
      handler: 'navigation.config',
    }
  ]
}
