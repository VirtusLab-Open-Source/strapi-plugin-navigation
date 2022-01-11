module.exports = {
  type: 'content-api',
  routes: [
		 {
      method: "GET",
      path: "/render/:idOrSlug",
      handler: "navigation.render",
      config: {
        policies: []
      }
    },
    {
      method: "GET",
      path: "/render/:idOrSlug/:childUIKey",
      handler: "navigation.renderChild",
      config: {
        policies: []
      }
    }
  ]
}
