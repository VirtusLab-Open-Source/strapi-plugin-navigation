import { Id, StringMap } from "strapi-typed";
import { IClientController, IClientService, NavigationServiceName } from "../../types";
import { getPluginService, parseParams } from "../utils";

const clientControllers: IClientController = {
  getService<T = IClientService>(name: NavigationServiceName= "client"): T {
    return getPluginService<T>(name);
  },

  async render(ctx) {
    const { params, query = {} } = ctx;
    const { type, menu: menuOnly, path: rootPath, locale } = query;
    const { idOrSlug } = parseParams<StringMap<string>, { idOrSlug: Id }>(
      params
    );
    return this.getService().render({
      idOrSlug,
      type,
      menuOnly,
      rootPath,
      locale,
    });
  },
  async renderChild(ctx) {
    const { params, query = {} } = ctx;
    const { type, menu: menuOnly, locale } = query;
    const { idOrSlug, childUIKey } = parseParams<
      StringMap<string>,
      { idOrSlug: Id; childUIKey: string }
    >(params);
    return this.getService().renderChildren({
      idOrSlug,
      childUIKey,
      type,
      menuOnly,
      locale,
    });
  },
};

export default clientControllers;
