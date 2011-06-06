var RecentTracksStream = require("./recenttracks-stream"),
    LastFmSession = require("./lastfm-session"),
    LastFmUpdate = require("./lastfm-update"),
    LastFmInfo = require("./lastfm-info"),
    LastFmRequest = require("./lastfm-request");

var LastFmNode = exports.LastFmNode = function(options) {
  options = options || {};
  this.url = "/2.0";
  this.host = "ws.audioscrobbler.com";
  this.format = "json";
  this.secret = options.secret;
  this.api_key = options.api_key;
  this.useragent = options.useragent || "lastfm-node";
};

LastFmNode.prototype.request = function(method, params) {
  return new LastFmRequest(this, method, params);
};

LastFmNode.prototype.stream = function(user, options) {
  return new RecentTracksStream(this, user, options);
};

LastFmNode.prototype.session = function(user, key) {
  return new LastFmSession(this, user, key);
};

LastFmNode.prototype.info = function(type, options) {
  return new LastFmInfo(this, type, options);
};

LastFmNode.prototype.update = function(method, session, options) {
  return new LastFmUpdate(this, method, session, options);
};
