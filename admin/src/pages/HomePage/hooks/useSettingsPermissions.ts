import { useMemo } from 'react';

import { useRBAC } from '@strapi/strapi/admin';

import pluginPermissions from '../../../utils/permissions';

export const useSettingsPermissions = () => {
  const viewPermissions = useMemo(
    () => ({
      access: pluginPermissions.access || pluginPermissions.update,
      update: pluginPermissions.update,
    }),
    []
  );

  const {
    isLoading: isLoadingForPermissions,
    allowedActions: { canUpdate, canAccess },
  } = useRBAC(viewPermissions);

  return { canAccess, canUpdate, isLoadingForPermissions };
};
