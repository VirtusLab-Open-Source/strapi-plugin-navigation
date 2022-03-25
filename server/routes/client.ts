import { StrapiRoutes, StrapiRoutesTypes } from "../../types";

const routes: StrapiRoutes = {
  type: StrapiRoutesTypes.CONTENT_API,
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

export default routes;
