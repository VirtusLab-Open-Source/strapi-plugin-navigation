import type * as nexusType from 'nexus';
import { ConfigContentTypeDTO } from '../../dtos';

export default ({ nexus }: { nexus: typeof nexusType }) =>
  nexus.objectType({
    name: 'ContentTypes',
    definition(t) {
      t.nonNull.string('uid');
      t.nonNull.string('name');
      t.nonNull.boolean('isSingle');
      t.nonNull.string('collectionName');
      t.nonNull.string('contentTypeName', { deprecation: 'use name', resolve: (t: ConfigContentTypeDTO) => t.name });
      t.nonNull.string('label', { deprecation: 'use name', resolve: (t: ConfigContentTypeDTO) => t.name });
      t.nonNull.string('relatedField');
      t.nonNull.string('labelSingular', { deprecation: 'use name', resolve: (t: ConfigContentTypeDTO) => t.name });
      t.nonNull.string('endpoint');
      t.nonNull.boolean('available');
      t.nonNull.boolean('visible');
    },
  });
