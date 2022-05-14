import { StrapiContentTypeFullSchema } from "strapi-typed";
import { ChangeEffect, NavigationPluginConfig } from "../../../../types";
export type RawPayload = {
  selectedContentTypes: string[];
  nameFields: Record<string, string[]>;
  audienceFieldChecked: boolean;
  allowedLevels: number;
  populate: Record<string, string[]>;
  i18nEnabled: boolean;
}

// TODO: This type should be replaced with new version of content type in new strapi-typed
export type ContentTypeToFix = StrapiContentTypeFullSchema & { available: boolean, isSingle: boolean, plugin: string, label: string }

export type PreparePayload = (payload: { form: RawPayload, pruneObsoleteI18nNavigations: boolean }) => NavigationPluginConfig;
export type OnSave = ChangeEffect<RawPayload>;
export type OnPopupClose = ChangeEffect<boolean>;
export type HandleSetContentTypeExpanded = ChangeEffect<string | undefined>;
export type PrepareNameFieldFor = (uid: string, current: Record<string, string[] | undefined>, value: string[]) => Record<string, string[] | undefined>;
export type RestartReasons = 'I18N' | 'GRAPH_QL' | 'I18N_NAVIGATIONS_PRUNE';
export type RestartStatus = { required: true, reasons?: RestartReasons[] } | { required: false };
