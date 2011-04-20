var EventEmitter = require("events").EventEmitter;
var utils = require("lastfm/utils");

var LastFmInfo = function(lastfm, type, options) {
  options = options || {};
  var that = this;
  EventEmitter.call(this);

  if (options.error) {
    this.on("error", options.error);
  }

  if (options.success) {
    this.on("success", options.success);
  }

  utils.registerHandlers(this, options.handlers);

  if (!type) {
    this.emit("error", new Error("Item type not specified"));
    return;
  }

  var enhancedParams = {
    track: function() {
      var params = { };
      if (typeof(options.track) == "object") {
        params.artist = options.track.artist["#text"];
        params.track = options.track.name;
        params.mbid = options.track.mbid;
      }
      return params;
    }
  };

  var params = enhancedParams[type] ? enhancedParams[type]() : {};

  Object.keys(options).forEach(function(name) {
    if (name != "error" && name != "success" && !params[name]) {
      params[name] = options[name];
    }
  });
  var method = type + ".getinfo";

  var request = lastfm.request(method, params);
  request.on("success", function(data) {
    try {
      var response = JSON.parse(data);
    }
    catch(e) {
      that.emit("error", new Error(e.message + ":" + data));
      return; 
    }

    if (response[type]) {
      that.emit("success", response[type]);
      return;
    };

    if (response.error) {
      that.emit("error", new Error(response.message));
      return;
    }

    that.emit("error", new Error("Unexpected error"));
  });
  request.on("error", function(error) {
    that.emit("error", error);
  });
};

LastFmInfo.prototype = Object.create(EventEmitter.prototype);

module.exports = LastFmInfo;
