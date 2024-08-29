import { Core } from '@strapi/strapi';
import permissions from './permissions';

export const setupPermissions = async ({ strapi }: { strapi: Core.Strapi }) => {
  // Add permissions
  const actions = [
    {
      section: 'plugins',
      displayName: 'Read',
      uid: permissions.navigation.read,
      pluginName: 'navigation',
    },
    {
      section: 'plugins',
      displayName: 'Update',
      uid: permissions.navigation.update,
      pluginName: 'navigation',
    },
    {
      section: 'plugins',
      displayName: 'Settings',
      uid: permissions.navigation.settings,
      pluginName: 'navigation',
    },
  ];
  await strapi.admin.services.permission.actionProvider.registerMany(actions);
};
