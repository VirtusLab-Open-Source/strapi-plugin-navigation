import { Core } from '@strapi/types';
import { getNavigationRepository } from '../repositories';

export const removeNavigationsWithoutDefaultLocale = async (context: { strapi: Core.Strapi }) => {
  const allNavigations = await getNavigationRepository(context).find({
    locale: '*',
    limit: Number.MAX_SAFE_INTEGER,
  });
  const defaultLocale = await context.strapi.plugin('i18n').service('locales').getDefaultLocale();
  await Promise.all(
    allNavigations.map(async (navigation) => {
      const root = allNavigations.find(
        ({ documentId, locale }) => documentId === navigation.documentId && locale === defaultLocale
      );
      if (!root) {
        await getNavigationRepository(context).remove({
          documentId: navigation.documentId,
          locale: navigation.locale,
        });
      }
    })
  );
};
