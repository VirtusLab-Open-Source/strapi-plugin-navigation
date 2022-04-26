const { NavigationError } = require("./NavigationError");

export class InvalidParamNavigationError extends NavigationError {}

module.exports = {
  InvalidParamNavigationError,
};
