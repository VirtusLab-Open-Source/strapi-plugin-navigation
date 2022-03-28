import { StrapiRoutes, StrapiRoutesTypes } from "../../types";

const routes: StrapiRoutes = {
  type: StrapiRoutesTypes.CONTENT_API,
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
