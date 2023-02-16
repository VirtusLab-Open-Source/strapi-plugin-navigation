import { StrapiContext } from "strapi-typed";
import { NavigationRawConfig } from "./config";
import { Navigation } from "./contentTypes";

export interface IConfigSetupStrategy {
  (context: StrapiContext): Promise<NavigationRawConfig>;
}

export interface INavigationSetupStrategy {
  (context: StrapiContext): Promise<Navigation[]>;
}

export interface IGraphQLSetupStrategy {
  (context: StrapiContext): Promise<void>;
}
