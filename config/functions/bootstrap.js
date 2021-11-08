const { isEmpty, get, last } = require('lodash');

const saveJSONParse = (value) => {
  try {
    return JSON.parse(value).map((_) => ({ ..._, id: _._id }));
  } catch (e) {
    return null;
  }
};

const getDefaultConnectionName = (strapi) => strapi.config.get('database.defaultConnection');

const isMongo = (strapi) => {
  const connectionName = getDefaultConnectionName(strapi);
  return strapi.config.get(`database.connections.${connectionName}.connector`).includes('mongo');
};

const getNavigationMorphData = (strapi) => {
  const connectionName = getDefaultConnectionName(strapi);
  const { [connectionName]: knex } = strapi.connections;
  return knex.schema.hasTable('navigations_items_morph').then((exist)=> exist ?  knex('navigations_items_morph').select('*') : []);
};

const getNavigationItemsModel = (strapi) => strapi.query('navigationitem', 'navigation');

const getRelatedModel = (strapi) => strapi.query('navigations_items_related', 'navigation');

const createRelatedData = (relatedModel, navigationItemsModel, items) => ({
  field,
  order,
  related_id,
  related_type,
  navigations_items_id,
}) => {
  const item = items.find(item => item.id === navigations_items_id);
  const modelUID = get(strapi.query(related_type), 'model.uid');
  if (item && modelUID) {
    const relatedData = {
      field,
      order,
      related_id,
      related_type: modelUID,
      master: get(item.master, 'id', item.master),
    };
    return relatedModel.create(relatedData)
      .then(
        ({ id }) => navigationItemsModel.update({ id: navigations_items_id }, { related: id }),
      );
  }
  return Promise.resolve();
};

const migrateNavigationItemsSQL = async (strapi) => {
  const morphData = await getNavigationMorphData(strapi);
  if (morphData.length) {
    const relatedModel = getRelatedModel(strapi);
    const navigationItemsModel = getNavigationItemsModel(strapi);
    const items = await navigationItemsModel.find({});
    await Promise.all(morphData.map(createRelatedData(relatedModel, navigationItemsModel, items)));
  }
};

const migrateNavigationItemsMongo = async (strapi) => {
  const navigationItemsModel = getNavigationItemsModel(strapi);
  const connectionName = getDefaultConnectionName(strapi);
  const models = strapi.connections[connectionName].models;
  const items = (await models.NavigationNavigationitem.find({}))
    // workaround to change type from object to int
    .map(_ => ({ ..._.toObject(), related: last(saveJSONParse(get(_.errors, 'related.properties.value', null))) }))
    .filter(_ => _.related);

  if (items.length) {
    await Promise.all(items.map(item => {
      const data = {
        related_id: item.related.ref,
        related_type: models[item.related.kind].uid,
        field: item.related.field,
        order: 1,
        master: item.master,
      };
      return getRelatedModel(strapi)
        .create(data)
        .then(result => navigationItemsModel.update({ id: item.id }, { related: [result.id] }));
    }));

  }
};

module.exports = async () => {
  // Check if the plugin users-permissions is installed because the navigation needs it
  if (Object.keys(strapi.plugins).indexOf('users-permissions') === -1) {
    throw new Error(
      'In order to make the navigation plugin work the users-permissions plugin is required',
    );
  }

  // Add permissions
  const actions = [
    {
      section: 'plugins',
      displayName: 'Access the Navigation',
      uid: 'read',
      pluginName: 'navigation',
    },
    {
      section: 'plugins',
      displayName: 'Ability to change the Navigation',
      uid: 'update',
      pluginName: 'navigation',
    },
  ];

  const navigations = await strapi
    .query('navigation', 'navigation')
    .find();
  if (isEmpty(navigations)) {
    await strapi
      .query('navigation', 'navigation')
      .create({
        name: 'Main navigation',
        slug: 'main-navigation',
        visible: true,
      });
  }
  const relatedModel = getRelatedModel(global.strapi);
  const isMigrated = !!(await relatedModel.count({}));
  if (!isMigrated) {
    const isMongoDB = isMongo(global.strapi);
    if (isMongoDB) {
      await migrateNavigationItemsMongo(global.strapi);
    } else {
      await migrateNavigationItemsSQL(global.strapi);
    }
  }

  const { actionProvider } = strapi.admin.services.permission;
  await actionProvider.registerMany(actions);
};
