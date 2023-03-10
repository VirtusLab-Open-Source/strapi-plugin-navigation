// @ts-ignore
import { request } from "@strapi/helper-plugin";
import { NavigationRawConfig } from "../../../../types";
import pluginId from "../../pluginId";

const navigationConfigQuery = "navigationConfigQuery";

export const NavigationConfigRepository = {
  getIndex() {
    return navigationConfigQuery;
  },
  fetch() {
    return request(`/${pluginId}/config`);
  },
  fetchViaSettings() {
    return request(`/${pluginId}/settings/config`);
  },
  update(body: NavigationRawConfig) {
    return request(`/${pluginId}/config`, { method: "PUT", body }, true);
  },
  restore() {
    return request(`/${pluginId}/config`, { method: "DELETE" }, true);
  },
};
