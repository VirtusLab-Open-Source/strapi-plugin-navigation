const bootstrap = require('./server/bootstrap');
const services = require('./server/services');
const routes = require('./server/routes');
const controllers = require('./server/controllers');
const contentTypes = require('./server/content-types');
const config = require('./server/config');
const register = require('./server/register');


module.exports = () => {
  return {
    bootstrap,
    config,
    routes,
    controllers,
    services,
    contentTypes,
    register,
  };
};
