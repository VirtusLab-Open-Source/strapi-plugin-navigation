export const prefixPluginTranslations = (input: Record<string, string>, pluginId: string) => {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [[pluginId, key].join('.'), value] as const)
  );
};
