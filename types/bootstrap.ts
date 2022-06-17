import { StrapiContext } from "strapi-typed";
import { NavigationPluginConfig } from "./config";
import { Navigation } from "./contentTypes";

export interface IConfigSetupStrategy {
  (context: StrapiContext): Promise<NavigationPluginConfig>;
}

export interface INavigationSetupStrategy {
  (context: StrapiContext): Promise<Navigation[]>;
}

export interface IGraphQLSetupStrategy {
  (context: StrapiContext): Promise<void>;
}
