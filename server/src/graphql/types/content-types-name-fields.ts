import { configSchema } from '../../schemas';
import { getPluginService } from '../../utils';

export default ({ nexus, strapi }: any) =>
  nexus.objectType({
    name: 'ContentTypesNameFields',
    async definition(t: any) {
      t.nonNull.list.nonNull.string('default');

      const commonService = getPluginService({ strapi }, 'common');
      const pluginStore = await commonService.getPluginStore();
      const config = configSchema.parse(await pluginStore.get({ key: 'config' }));
      const contentTypesNameFields = config.contentTypesNameFields;

      Object.keys(contentTypesNameFields || {}).forEach((key) => t.nonNull.list.string(key));
    },
  });
