import bootstrap from './server/bootstrap';
import config from './server/config';
import contentTypes from './server/content-types';
import controllers from './server/controllers';
import destroy from './server/destroy';
import register from './server/register';
import routes from './server/routes';
import services from './server/services';

export = () => ({
  bootstrap,
  config,
  contentTypes,
  controllers,
  destroy,
  middlewares: {},
  policies: {},
  register,
  routes,
  services,
});
