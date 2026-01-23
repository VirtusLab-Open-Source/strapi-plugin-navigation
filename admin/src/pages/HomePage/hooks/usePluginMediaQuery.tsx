import { usePluginTheme } from '@sensinum/strapi-utils';
import { useIsDesktop, useIsMobile, useIsTablet, useMediaQuery } from '@strapi/strapi/admin';

export const usePluginMediaQuery = () => {
  const {
    theme: { breakpoints },
  } = usePluginTheme();

  const isSmallMobile = !useMediaQuery(breakpoints.small);
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  const isLargeDesktop = useMediaQuery(`@media (min-width: 1280px)`);

  return { isSmallMobile, isMobile, isTablet, isDesktop, isLargeDesktop };
};
