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
        method: "user.getinfo",
        user: options.user
      };

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
    },
    track: function() {
    }
  };

  if (methods[type]) {
    methods[type]();
    return;
  }

  this.emit("error", new Error("Unknown item type"));
};

LastFmInfo.prototype = Object.create(EventEmitter.prototype);

exports.LastFmInfo = LastFmInfo;
