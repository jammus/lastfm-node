var EventEmitter = require("events").EventEmitter;
var RecentTracksParser = require("./recenttracks-parser");
var utils = require("./utils");

var RecentTracksStream = module.exports = function(lastfm, user, options) {
  if (!options) options = {};
  var that = this;

  this.lastfm = lastfm;
  this.lastPlay = null;
  this.nowPlaying = null;
  this.rate = 10;
  this.parser = options.parser || new RecentTracksParser();
  this.user = user;

  EventEmitter.call(this);

  utils.registerHandlers(this, options.handlers);

  registerListeners();

  initParser();

  if (options.autostart) {
    this.start();
  }

  function registerListeners() {
    var events = ["error", "lastPlayed", "nowPlaying", "stoppedPlaying", "scrobbled"];
    events.forEach(function (event) {
      if (options[event]) that.on(event, options[event]);
    });
  };

  function initParser() {
    that.parser.on("track", function(tracks) {
      if (tracks instanceof Array) {
        that.processNowPlaying(tracks[0]);
        that.processLastPlay(tracks[1]);
        return;
      }

      var track = tracks;
      if (track["@attr"] && track["@attr"]["nowplaying"]) {
        that.processNowPlaying(track);
        return;
      }
  
      that.processLastPlay(track);
      if (that.nowPlaying) {
        that.emit("stoppedPlaying", that.nowPlaying);
        that.nowPlaying = null;
      }
    });

    that.parser.on("error", function(error) {
      that.emit("error", error);
    });
  }
};

RecentTracksStream.prototype = Object.create(EventEmitter.prototype);

RecentTracksStream.prototype.processNowPlaying = function(track) {
  var sameTrack = (this.nowPlaying && this.nowPlaying.name == track.name);
  if (!sameTrack) {
    this.nowPlaying = track;
    this.emit("nowPlaying", track);
  }
};

RecentTracksStream.prototype.processLastPlay = function(track) {
  if (!this.lastPlay) {
    this.lastPlay = track;
    this.emit("lastPlayed", track);
    return;
  }

  var sameTrack = (this.lastPlay.name == track.name);
  if (!sameTrack) {
    this.lastPlay = track;
    this.emit("scrobbled", track);
  }
};

RecentTracksStream.prototype.start = function() {
  var that = this;
  this.isStreaming = true;

  var check = function() {
    var request = that.lastfm.request("user.getrecenttracks", {
        user: that.user,
        limit: 1
    });
    request.on("success", function(data) {
      that.parser.parse(data);
    });
    request.on("error", function(error) {
      that.emit("error", error);
    });
    if (that.isStreaming) that.timeout = setTimeout(check, that.rate * 1000);
  }

  check();
};

RecentTracksStream.prototype.stop = function() {
  clearTimeout(this.timeout);
  this.isStreaming = false;
};
