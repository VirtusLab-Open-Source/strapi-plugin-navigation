"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.navigationSetup = void 0;
const repositories_1 = require("../repositories");
const utils_1 = require("../utils");
const DEFAULT_NAVIGATION_NAME = 'Navigation';
const DEFAULT_NAVIGATION_SLUG = 'navigation';
const navigationSetup = async (context) => {
    const commonService = (0, utils_1.getPluginService)(context, 'common');
    const { defaultLocale, restLocale = [] } = await commonService.readLocale();
    const navigationRepository = (0, repositories_1.getNavigationRepository)(context);
    const navigations = await navigationRepository.find({
        limit: Number.MAX_SAFE_INTEGER,
        filters: {},
        locale: '*',
    });
    if (navigations.length === 0) {
        navigations.push(await navigationRepository.save({
            name: DEFAULT_NAVIGATION_NAME,
            visible: true,
            locale: defaultLocale,
            slug: DEFAULT_NAVIGATION_SLUG,
        }));
    }
    const defaultLocaleNavigations = navigations.filter(({ locale }) => locale === defaultLocale);
    for (const defaultLocaleNavigation of defaultLocaleNavigations) {
        for (const otherLocale of restLocale) {
            const otherLocaleMissing = !navigations.find(({ locale, documentId }) => documentId === defaultLocaleNavigation.documentId && otherLocale === locale);
            if (otherLocaleMissing) {
                await navigationRepository.save({
                    documentId: defaultLocaleNavigation.documentId,
                    name: defaultLocaleNavigation.name,
                    locale: otherLocale,
                    visible: defaultLocaleNavigation.visible,
                    slug: defaultLocaleNavigation.slug,
                });
            }
        }
    }
};
exports.navigationSetup = navigationSetup;
