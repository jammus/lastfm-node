var _ = require("underscore");

module.exports = {
  registerHandlers : function(source, handlers) {
    if (typeof(handlers) == "object") {
      _(Object.keys(handlers)).each(function(key) {
        source.on(key, handlers[key]);
      });
    }
  }
}
