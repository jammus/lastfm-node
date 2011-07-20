var EventEmitter = require("events").EventEmitter,
    utils = require("./utils");

var LastFmInfo = function(lastfm, type, options) {
  var that = this;
  EventEmitter.call(this);
  options = options || {};

  registerEventHandlers(options);

  if (!type) {
    this.emit("error", new Error("Item type not specified"));
    return;
  }

  requestInfo(options);

  function registerEventHandlers(options) {
    if (options.error) {
      that.on("error", options.error);
    }
    if (options.success) {
      that.on("success", options.success);
    }
    utils.registerHandlers(that, options.handlers);
  }

  function requestInfo(options) {
    var params = buildRequestParams(options),
        method = type + ".getinfo",
        request = lastfm.request(method, params);
    request.on("success", success);
    request.on("error", error);
  }

  function buildRequestParams(params) {
    var requestParams = filterSpecialParameters(params);
    if (type === "track" && typeof params.track === "object") {
      requestParams.artist = params.track.artist["#text"];
      requestParams.track = params.track.name;
      requestParams.mbid = params.track.mbid;
    }
    return requestParams;
  }

  function filterSpecialParameters(params) {
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
