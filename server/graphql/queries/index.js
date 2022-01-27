module.exports = (context) => {
	const queries = {
		renderNavigationChild: require('./render-navigation-child'),
		renderNavigation: require('./render-navigation'),
	}

  return context.nexus.extendType({
    type: 'Query',
		definition(t) {
			for (const [name, configFactory] of Object.entries(queries)) {
				const config = configFactory(context);

				t.field(name, config);
			}
    },
  });
};
