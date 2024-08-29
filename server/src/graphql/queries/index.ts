import { renderNavigation } from './render-navigation';
import { renderNavigationChild } from './render-navigation-child';

export const getQueries = (context: any) => {
  const queries = {
    renderNavigationChild,
    renderNavigation,
  };

  return context.nexus.extendType({
    type: 'Query',
    definition(t: any) {
      for (const [name, configFactory] of Object.entries(queries)) {
        const config = configFactory(context);

        t.field(name, config);
      }
    },
  });
};
