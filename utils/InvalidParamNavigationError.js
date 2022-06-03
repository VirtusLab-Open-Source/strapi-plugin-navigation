const { NavigationError } = require("./NavigationError");

class InvalidParamNavigationError extends NavigationError {}

module.exports = {
  InvalidParamNavigationError,
};
