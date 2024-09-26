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
    where: {},
  });

  if (navigations.length === 0) {
    navigations.push(
      await navigationRepository.save({
        name: DEFAULT_NAVIGATION_NAME,
        localeCode: defaultLocale,
        visible: true,
        slug: `${DEFAULT_NAVIGATION_SLUG}-${defaultLocale}`,
      })
    );

    console.log("");
    console.log(`Fallback navigation added`);
  }

  const defaultLocaleNavigations = navigations.filter(
    ({ localeCode }) => localeCode === defaultLocale
  );

  for (const defaultLocaleNavigation of defaultLocaleNavigations) {
    for (const otherLocale of restLocale) {
      const otherLocaleMissing = !navigations.find(
        ({ localeCode, documentId }) =>
          documentId === defaultLocaleNavigation.documentId && otherLocale === localeCode
      );

      if (otherLocaleMissing) {
        console.log(
          `Missing locale "${otherLocale}" for "${defaultLocaleNavigation.name}". Adding...`
        );

        await navigationRepository.save({
          documentId: defaultLocaleNavigation.documentId,
          name: defaultLocaleNavigation.name,
          localeCode: otherLocale,
          visible: defaultLocaleNavigation.visible,
          slug: `${defaultLocaleNavigation.slug}-${otherLocale}`,
        });

        console.log(`Added.`);
      }
    }
  }
};
