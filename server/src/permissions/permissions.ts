'use strict';

export default {
  render: function (uid: string) {
    return `plugin::navigation.${uid}`;
  },
  navigation: {
    read: 'read',
    update: 'update',
    settings: 'settings',
  },
};
