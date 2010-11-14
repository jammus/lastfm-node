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
  this.lastfm.readRequest({token: token, method: "auth.getsession"}, true, function(data) {
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

LastFmSession.prototype.update = function(method, track, options) {
  var that = this;
   
  var nowPlaying = function(track) {
    that.lastfm.writeRequest({ method: "track.updateNowPlaying", artist: track.artist["#text"], track: track.name, sk: that.key }, true, handleResponse );
  };

  var scrobble = function(track, options) {
    if (!options.timestamp) {
      that.emit("error", new Error("Timestamp is required for scrobbling"));
      return;
    }

    that.lastfm.writeRequest({ method: "track.scrobble", artist: track.artist["#text"], track: track.name, sk: that.key, timestamp: options.timestamp }, true, handleResponse );
  };

  var handleResponse = function(data) {
    var response = JSON.parse(data);
    if (!response) return;
    if (response.error) {
      that.emit("error", new Error(response.message));
      return;
    }
    that.emit("success", track);
  };
  
  if (!this.key) {
    this.emit("error", new Error("Session is not authorised"));
    return;
  }

  if (!options) options = {};


  if (method == "nowplaying") {
    nowPlaying(track); 
  }
  if (method == "scrobble") {
    scrobble(track, options);
  }
};

exports.LastFmSession = LastFmSession;
