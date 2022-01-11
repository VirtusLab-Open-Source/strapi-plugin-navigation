const typesFactories = [
	require('./navigation-item'),
	require('./navigation-related'),
	require('./navigation-render-type'),
	require('./navigation'),
	require('./navigation-details'),
	require('./content-types-name-fields'),
	require('./content-types'),
	require('./navigation-config'),
	require('./create-navigation-related'),
	require('./create-navigation-item'),
	require('./create-navigation'),
];

module.exports = context => typesFactories.map(factory => factory(context));