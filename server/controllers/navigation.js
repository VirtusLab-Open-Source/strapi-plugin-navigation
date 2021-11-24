const getService = () => strapi.plugin('navigation').service('navigation');

module.exports = {
	async config() {
    return getService().config();
	},
  async get() {
    return getService().get();
  },
};