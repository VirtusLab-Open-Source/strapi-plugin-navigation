import { StrapiRoutes } from "../../types";

const routes: StrapiRoutes = {
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
    }
  ]
}

export default routes;
