var EventEmitter = require("events").EventEmitter
  , _ = require("underscore");

var LastFmBase = function() {
  EventEmitter.call(this);
};

LastFmBase.prototype = Object.create(EventEmitter.prototype);

LastFmBase.prototype.registerHandlers = function(handlers) {
  if (typeof handlers !== "object") {
    return;
  }
  
  var that = this;
  _(handlers).each(function(value, key) {
    that.on(key, value);
  });
};

var defaultBlacklist = ["error", "success", "handlers"];
LastFmBase.prototype.filterParameters = function(parameters, blacklist) {
  var filteredParams = {};
  _(parameters).each(function(value, key) {
    if (isBlackListed(key)) {
      return;
    }
    filteredParams[key] = value;
  });
  return filteredParams;
  
  function isBlackListed(name) {
    return _(defaultBlacklist).include(name) || _(blacklist).include(name);
  }
};

LastFmBase.prototype.scheduleCallback = function(callback, delay) {
  return setTimeout(callback, delay);
};

LastFmBase.prototype.cancelCallback = function(identifier) {
  clearTimeout(identifier);
};

module.exports = LastFmBase;
