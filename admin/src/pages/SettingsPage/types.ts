import { StrapiContentTypeFullSchema } from "strapi-typed";
import { Effect, NavigationItemCustomField, NavigationRawConfig } from "../../../../types";
export type RawPayload = {
  allowedLevels: number;
  audienceFieldChecked: boolean;
  i18nEnabled: boolean;
  nameFields: Record<string, string[]>;
  pathDefaultFields: Record<string, string[]>;
  populate: Record<string, string[]>;
  selectedContentTypes: string[];
}
export type StrapiContentTypeSchema = StrapiContentTypeFullSchema & { available: boolean, isSingle: boolean, plugin: string, label: string  }

export type PreparePayload = (payload: { form: RawPayload, pruneObsoleteI18nNavigations: boolean, customFields: NavigationItemCustomField[]}) => NavigationRawConfig;
export type OnSave = Effect<RawPayload>;
export type OnPopupClose = Effect<boolean>;
export type HandleSetContentTypeExpanded = Effect<string | undefined>;
export type RestartReasons = 'I18N' | 'GRAPH_QL' | 'I18N_NAVIGATIONS_PRUNE';
export type RestartStatus = { required: true, reasons?: RestartReasons[] } | { required: false };
