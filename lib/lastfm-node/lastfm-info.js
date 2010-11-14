var EventEmitter = require('events').EventEmitter;

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

  var methods = {
    user: function() {
      var params = {
        method: "user.getinfo"
      };
      return params;
    },
    track: function() {
      var params = {
        method: "track.getinfo"
      };
      if (typeof(options.track) == "object") {
        params.artist = options.track.artist["#text"];
        params.track = options.track.name;
        params.mbid = options.track.mbid;
      }
      return params;
    }
  };

  if (!methods[type]) {
    this.emit("error", new Error("Unknown item type"));
    return;
  }

  var params = methods[type]();

  Object.keys(options).forEach(function(name) {
    if (name != "error" && name != "success" && !params[name]) params[name] = options[name];
  });

  lastfm.readRequest(params, false, function(data) {
    var item = JSON.parse(data);
    if (item[type]) {
      that.emit("success", item[type]);
      return;
    };
    if (item.error) {
      that.emit("error", new Error(item.message));
      return;
    }
    that.emit("error", new Error("Unexpected error"));
  });
};

LastFmInfo.prototype = Object.create(EventEmitter.prototype);

exports.LastFmInfo = LastFmInfo;
