const permissions = require('../../permissions');

const pluginPermissions = {
    access: [{ action: permissions.render(permissions.navigation.read), subject: null }],
    update: [{ action: permissions.render(permissions.navigation.update), subject: null }],
  };
  
  export default pluginPermissions;