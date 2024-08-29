export type NavigationServerRoute = (typeof routes.routes)[number] & {
  info?: {
    pluginName: string
  }
}

const routes = {
  type: 'content-api',
  routes: [
    {
      method: "GET",
      path: "/render/:idOrSlug",
      handler: "client.render",
      config: {
        policies: []
      }
    },
    {
      method: "GET",
      path: "/render/:idOrSlug/:childUIKey",
      handler: "client.renderChild",
      config: {
        policies: []
      }
    },
    {
      method: "GET",
      path: "/",
      handler: "client.readAll",
      config: {
        policies: []
      }
    }
  ]
}

export default routes;
