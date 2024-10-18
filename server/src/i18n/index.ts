import { Core } from '@strapi/strapi';
import { getNavigationRepository } from '../repositories';
import { getPluginService } from '../utils';

const DEFAULT_NAVIGATION_NAME = 'Navigation';
const DEFAULT_NAVIGATION_SLUG = 'navigation';

export const navigationSetup = async (context: { strapi: Core.Strapi }) => {
  const commonService = getPluginService(context, 'common');

  const { defaultLocale, restLocale = [] } = await commonService.readLocale();

  const navigationRepository = getNavigationRepository(context);

  const navigations = await navigationRepository.find({
    limit: Number.MAX_SAFE_INTEGER,
    filters: {},
    locale: '*',
  });

  if (navigations.length === 0) {
    navigations.push(
      await navigationRepository.save({
        name: DEFAULT_NAVIGATION_NAME,
        visible: true,
        locale: defaultLocale,
        slug: `${DEFAULT_NAVIGATION_SLUG}-${defaultLocale}`,
      })
    );
  }

  const defaultLocaleNavigations = navigations.filter(
    ({ locale }) => locale === defaultLocale
  );

  for (const defaultLocaleNavigation of defaultLocaleNavigations) {
    for (const otherLocale of restLocale) {
      const otherLocaleMissing = !navigations.find(
        ({ locale, documentId }) =>
          documentId === defaultLocaleNavigation.documentId && otherLocale === locale
      );

      if (otherLocaleMissing) {
        await navigationRepository.save({
          documentId: defaultLocaleNavigation.documentId,
          name: defaultLocaleNavigation.name,
          locale: otherLocale,
          visible: defaultLocaleNavigation.visible,
          slug: `${defaultLocaleNavigation.slug.replace(`-${defaultLocale}`, '')}-${otherLocale}`,
        });
      }
    }
  }
};
