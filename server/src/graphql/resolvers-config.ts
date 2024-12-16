export const getResolversConfig = () => ({
  'Query.renderNavigationChild': { auth: false },
  'Query.renderNavigation': { auth: false },
});
