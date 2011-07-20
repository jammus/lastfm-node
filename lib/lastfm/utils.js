var _ = require("underscore");

module.exports = {
  registerHandlers: function(source, handlers) {
    if (typeof handlers !== "object") {
      return;
    }

    _(handlers).each(function(value, key) {
      source.on(key, value);
    });
  },

  filterParameters: function(parameters, blacklist) {
    var filteredParams = {};
    _(parameters).each(function(value, key) {
      if (isBlackListed(key)) {
        return;
      }
      filteredParams[key] = value;
    });
    return filteredParams;

    function isBlackListed(name) {
      return _(blacklist).include(name);
    }
  }
}
