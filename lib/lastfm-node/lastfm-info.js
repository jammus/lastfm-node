var EventEmitter = require('events').EventEmitter;

var LastFmInfo = function(lastfm, type, options) {
  EventEmitter.call(this);

  options = options || {};

  if (options.error) {
    this.on("error", options.error);
  }

  if (options.success) {
    this.on("success", options.success);
  }

  var validType = "user";
  if (type != validType) {
    this.emit("error", new Error("Unknown item type"));
    return;
  }

  var params = {
    method: "user.getinfo",
    user: options.user
  };

  var that = this;
  lastfm.readRequest(params, false, function(data) {
    var item = JSON.parse(data);
    if (item.error) {
      that.emit("error", new Error(item.message));
      return;
    }
    if (!item.user) {
      that.emit("error", new Error("Unexpected error"));
      return;
    }
    that.emit("success", item.user);
  });
};

LastFmInfo.prototype = Object.create(EventEmitter.prototype);

exports.LastFmInfo = LastFmInfo;
