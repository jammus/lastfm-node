var EventEmitter = require("events").EventEmitter
  , utils = require("./utils");

var LastFmInfo = function(lastfm, type, options) {
  var that = this;
  options = options || {};
  EventEmitter.call(this);

  registerEventHandlers(options);
  requestInfo(type, options);

  function registerEventHandlers(options) {
    if (options.error) {
      that.on("error", options.error);
    }
    if (options.success) {
      that.on("success", options.success);
    }
    utils.registerHandlers(that, options.handlers);
  }

  function requestInfo(type, options) {
    if (!type) {
      that.emit("error", new Error("Item type not specified"));
      return;
    }

    var params = buildRequestParams(options)
      , method = type + ".getinfo"
      , request = lastfm.request(method, params);
    request.on("success", success);
    request.on("error", error);
  }

  function buildRequestParams(params) {
    var requestParams = filterOutSpecialParameters(params);
    return requestParams;
  }

  function filterOutSpecialParameters(params) {
    var specialParameterNames = ["error", "success", "handlers"];
    return utils.filterParameters(params, specialParameterNames);
  }

  function success(response) {
    if (response[type]) {
      that.emit("success", response[type]);
      return;
    }
    that.emit("error", new Error("Unexpected error"));
  }
  
  function error(error) {
    that.emit("error", error);
  }
};

LastFmInfo.prototype = Object.create(EventEmitter.prototype);

module.exports = LastFmInfo;
