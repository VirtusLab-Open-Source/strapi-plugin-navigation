import permissions from '../../permissions';

const pluginPermissions = {
    access: [{ action: permissions.render(permissions.navigation.read), subject: null }],
    update: [{ action: permissions.render(permissions.navigation.update), subject: null }],
    settings: [{ action: permissions.render(permissions.navigation.settings), subject: null }],
  };
  
export default pluginPermissions;