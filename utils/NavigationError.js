class NavigationError extends Error {
  constructor(message, additionalInfo) {
    super(message);
    this.additionalInfo = additionalInfo;
  }

}

module.exports = {
  NavigationError,
};
