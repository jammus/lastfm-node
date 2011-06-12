var EventEmitter = require("events").EventEmitter;
var utils = require("./utils");
var _ = require("underscore");

var LastFmUpdate = function(lastfm, method, session, options) {
  EventEmitter.call(this);
  var that = this;

  if (options.error) {
    this.on("error", options.error);
  }
  if (options.success) {
    this.on("success", options.success);
  }

  utils.registerHandlers(this, options.handlers);
    
  if (!session.isAuthorised()) {
    this.emit("error", new Error("Session is not authorised"));
    return;
  }

  if (!options) options = {};

  if (method == "nowplaying") {
    nowPlaying(options); 
  }
  if (method == "scrobble") {
    scrobble(options);
  }
  
  function nowPlaying(options) {
    var params = filterOptions(options);
    var request = lastfm.request("track.updateNowPlaying", params);
    request.on("success", handleResponse);
    request.on("error", bubbleError);
  }

  function scrobble(options) {
    if (!options.timestamp) {
      that.emit("error", new Error("Timestamp is required for scrobbling"));
      return;
    }
    var params = filterOptions(options);
    var request = lastfm.request("track.scrobble", params);
    request.on("success", handleResponse);
    request.on("error", bubbleError);
  }

  function handleResponse(data) {
    var response = JSON.parse(data);
    if (!response) return;
    if (response.error) {
      that.emit("error", new Error(response.message));
      return;
    }
    that.emit("success", options.track);
  }

  function bubbleError(error) {
    that.emit("error", error);
  }

  function filterOptions(options) {
    var params = {
      sk: session.key
    };
    _(Object.keys(options)).each(function(key) {
      if (key == "track" && typeof(options.track) == "object") {
        params.artist = options.track.artist["#text"];
        params.track = options.track.name;
        return;
      }
      if (key != "handlers" && key != "success" && key != "error" && options[key]) {
        params[key] = options[key];
      }
    });
    return params;
  }
}

LastFmUpdate.prototype = Object.create(EventEmitter.prototype);

module.exports = LastFmUpdate;

