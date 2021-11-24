const getService = () => strapi.plugin('navigation').service('navigation');
const parseParams = (params) =>
  Object.keys(params).reduce((prev, curr) => {
    const value = params[curr];
    const parsedValue = isNaN(Number(value)) ? value : parseInt(value, 10);
    return {
      ...prev,
      [curr]: parsedValue,
    };
  }, {});

module.exports = {
	async config() {
    return getService().config();
	},
  async get() {
    return getService().get();
  },
  async getById(ctx) {
    const { params } = ctx;
    const { id } = parseParams(params);
    return getService().getById(id);
  },
};