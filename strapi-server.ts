import bootstrap from './server/bootstrap';
import services from './server/services';
import routes from './server/routes';
import controllers from './server/controllers';
import contentTypes from './server/content-types';
import config from './server/config';

export = () => ({
  bootstrap,
  config,
  routes,
  controllers,
  services,
  contentTypes,
});
