module.exports = ({ strapi, nexus }) => {
	const { nonNull, list, stringArg, booleanArg } = nexus;
	return {
		type: nonNull(list('NavigationItem')),
		args: {
			navigationIdOrSlug: nonNull(stringArg()),
			type: 'NavigationRenderType',
			menuOnly: booleanArg()
		},
		resolve(obj, args) {
			const { navigationIdOrSlug: idOrSlug, type, menuOnly } = args;
			return strapi.plugin('navigation').service('navigation').render({idOrSlug, type, menuOnly});
		},
	};
}
