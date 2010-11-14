var EventEmitter = require("events").EventEmitter;

var LastFmUpdate = function(lastfm, method, session, options) {
  EventEmitter.call(this);
  var that = this;

  if (options.error) this.on("error", options.error);
  if (options.success) this.on("success", options.success);
   
  var nowPlaying = function(track) {
    lastfm.writeRequest({ method: "track.updateNowPlaying", artist: track.artist["#text"], track: track.name, sk: session.key }, true, handleResponse );
  };

  var scrobble = function(track, options) {
    if (!options.timestamp) {
      that.emit("error", new Error("Timestamp is required for scrobbling"));
      return;
    }

    lastfm.writeRequest({ method: "track.scrobble", artist: track.artist["#text"], track: track.name, sk: session.key, timestamp: options.timestamp }, true, handleResponse );
  };

  var handleResponse = function(data) {
    var response = JSON.parse(data);
    if (!response) return;
    if (response.error) {
      that.emit("error", new Error(response.message));
      return;
    }
    that.emit("success", options.track);
  };
  
  if (!session.key) {
    this.emit("error", new Error("Session is not authorised"));
    return;
  }

  if (!options) options = {};


  if (method == "nowplaying") {
    nowPlaying(options.track); 
  }
  if (method == "scrobble") {
    scrobble(options.track, options);
  }

}

LastFmUpdate.prototype = Object.create(EventEmitter.prototype);

exports.LastFmUpdate = LastFmUpdate;

