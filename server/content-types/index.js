"use strict"

const navigationsItemsRelated = require("./navigations_items_related");
const navigationItem = require("./navigationItem");
const navigation = require("./navigation");
const audience = require("./audience");

module.exports = {
  audience,
  navigation,
  "navigation-item": navigationItem,
  "navigations-items-related": navigationsItemsRelated
};
