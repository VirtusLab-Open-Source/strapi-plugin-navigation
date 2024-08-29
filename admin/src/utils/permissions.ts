'use strict';

const render = (uid: string) => {
  return `plugin::navigation.${uid}`;
};

const navigation = {
  read: 'read',
  update: 'update',
  settings: 'settings',
};

// This should be equal to admin side. Strapi push to make admin and server independent chunks. 
const pluginPermissions = {
  access: [{ action: render(navigation.read), subject: null }],
  update: [{ action: render(navigation.update), subject: null }],
  settings: [{ action: render(navigation.settings), subject: null }],
};

export default pluginPermissions;
