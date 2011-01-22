var EventEmitter = require("events").EventEmitter;

var LastFmSession = function(lastfm, user, key) {
  EventEmitter.call(this);
  this.lastfm = lastfm;
  this.user = user || "";
  this.key = key || "";
};

LastFmSession.prototype = Object.create(EventEmitter.prototype);

LastFmSession.prototype.authorise = function(token, options) {
  if (!options) options = {};
  if (options.error) {
    this.on("error", options.error);
  }
  if (options.authorised) {
    this.on("authorised", options.authorised);
  }

  if (!token) {
    this.emit("error", new Error("No token supplied"));
    return;
  }

  var that = this;
  this.lastfm.read({token: token, method: "auth.getsession"}, true, function(data) {
    var result = JSON.parse(data); 

    if (result.error) {
      that.emit("error", new Error(result.message));
      return;
    }

    if (result.session) {
      that.user = result.session.name;
      that.key = result.session.key;
      that.emit("authorised", that);
      return;
    } 

    that.emit("error", new Error("Unexpected error"));
  });
};

LastFmSession.prototype.isAuthorised = function() {
  return this.key && this.key != '';
};

exports.LastFmSession = LastFmSession;
