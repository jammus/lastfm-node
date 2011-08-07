var EventEmitter = require("events").EventEmitter,
    utils = require("./utils"),
    _ = require("underscore");

var LastFmUpdate = function(lastfm, method, session, options) {
  var that = this;
  options = options || {};
  EventEmitter.call(this);

  registerEventHandlers(options);
    
  if (!session.isAuthorised()) {
    this.emit("error", new Error("Session is not authorised"));
    return;
  }

  if (method == "nowplaying") {
    updateNowPlaying(options); 
  }
  if (method == "scrobble") {
    scrobble(options);
  }

  function registerEventHandlers(options) {
    if (options.error) {
      that.on("error", options.error);
    }
    if (options.success) {
      that.on("success", options.success);
    }
    utils.registerHandlers(that, options.handlers);
  }
  
  function updateNowPlaying(options) {
    var params = buildRequestParams(options);
    var request = lastfm.request("track.updateNowPlaying", params);
    request.on("success", handleResponse);
    request.on("error", bubbleError);
  }

  function scrobble(options) {
    if (!options.timestamp) {
      that.emit("error", new Error("Timestamp is required for scrobbling"));
      return;
    }
    var params = buildRequestParams(options);
    var request = lastfm.request("track.scrobble", params);
    request.on("success", handleResponse);
    request.on("error", bubbleError);
  }

  function handleResponse(response) {
    if (!response) return;
    that.emit("success", options.track);
  }

  function bubbleError(error) {
    that.emit("error", error);
  }

  function buildRequestParams(params) {
    var requestParams = filterOutSpecialParameters(params);
    requestParams.sk = session.key;
    if (params.track && typeof params.track=== "object") {
      requestParams.artist = params.track.artist["#text"];
      requestParams.track = params.track.name;
    }
    return requestParams;
  }

  function filterOutSpecialParameters(params) {
    var specialParameterNames = ["error", "success", "handlers"];
    return utils.filterParameters(params, specialParameterNames);
  }
}

LastFmUpdate.prototype = Object.create(EventEmitter.prototype);

module.exports = LastFmUpdate;

