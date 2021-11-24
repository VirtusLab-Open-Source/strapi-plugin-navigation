"use strict"

const navigationsItemsRelated = require("./navigations-items-related");
const navigationItem = require("./navigation-item");
const navigation = require("./navigation");
const audience = require("./audience");

module.exports = {
  audience,
  navigation,
  "navigation-item": navigationItem,
  "navigations-items-related": navigationsItemsRelated
};
