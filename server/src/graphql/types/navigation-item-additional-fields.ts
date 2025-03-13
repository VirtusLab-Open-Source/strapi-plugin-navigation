import { NavigationItemAdditionalField } from '../../schemas';

export default ({ nexus, config }: any) =>
  nexus.objectType({
    name: 'NavigationItemAdditionalFields',
    definition(t: any) {
      // Additional Fields
      config.additionalFields.forEach((field: NavigationItemAdditionalField) => {
        if (field !== 'audience') {
          if (field.enabled) {
            switch (field.type) {
              case 'media':
                t.field(field.name, { type: 'UploadFile' });
                break;
              case 'string':
                t.string(field.name);
                break;
              case 'boolean':
                t.boolean(field.name);
                break;
              case 'select':
                if (field.multi) t.list.string(field.name);
                else t.string(field.name);
                break;
              default:
                throw new Error(
                  `Type "${JSON.stringify((field as any).type)}" is unsupported by custom fields`
                );
            }
          }
        }
      });
    },
  });
