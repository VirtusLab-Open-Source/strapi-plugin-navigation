import { StrapiContentTypeFullSchema } from "strapi-typed";
import { Effect, NavigationPluginConfig } from "../../../../types";
export type RawPayload = {
  selectedContentTypes: string[];
  nameFields: Record<string, string[]>;
  audienceFieldChecked: boolean;
  allowedLevels: number;
  populate: Record<string, string[]>;
  i18nEnabled: boolean;
}
export type StrapiContentTypeSchema = StrapiContentTypeFullSchema & { available: boolean, isSingle: boolean, plugin: string, label: string  }

export type PreparePayload = (payload: { form: RawPayload, pruneObsoleteI18nNavigations: boolean }) => Omit<NavigationPluginConfig, "slugify">;
export type OnSave = Effect<RawPayload>;
export type OnPopupClose = Effect<boolean>;
export type HandleSetContentTypeExpanded = Effect<string | undefined>;
export type PrepareNameFieldFor = (uid: string, current: Record<string, string[] | undefined>, value: string[]) => Record<string, string[] | undefined>;
export type RestartReasons = 'I18N' | 'GRAPH_QL' | 'I18N_NAVIGATIONS_PRUNE';
export type RestartStatus = { required: true, reasons?: RestartReasons[] } | { required: false };
