var EventEmitter = require('events').EventEmitter;
var RecentTracksParser = require('./recenttracks-parser').RecentTracksParser;

RecentTracksStream = function(lastfm, user, options) {
  EventEmitter.call(this);
  if (!options) options = {};
  var that = this;
  this.lastfm = lastfm;
  this.lastPlay = null;
  this.nowPlaying = null;
  this.rate = 10;
  this.parser = options.parser || new RecentTracksParser();

  this.params = {
    method : 'user.getrecenttracks',
    user : user,
    limit : 1
  }

  this.parser.addListener('track', function(tracks) {
    if (tracks instanceof Array) {
      that.processNowPlaying(tracks[0]);
      that.processLastPlay(tracks[1]);
      return;
    }

    var track = tracks;
    if (track['@attr'] && track['@attr']['nowplaying']) {
      that.processNowPlaying(track);
      return;
    }

    that.processLastPlay(track);
    if (that.nowPlaying) {
      that.emit('stoppedPlaying', that.nowPlaying);
      that.nowPlaying = null;
    }
  });

  this.parser.addListener('error', function(error) {
    that.emit('error', error);
  });
};


RecentTracksStream.prototype = Object.create(EventEmitter.prototype);

RecentTracksStream.prototype.processNowPlaying = function(track) {
  var sameTrack = (this.nowPlaying && this.nowPlaying.name == track.name);
  if (!sameTrack) {
    this.nowPlaying = track;
    this.emit('nowPlaying', track);
  }
};

RecentTracksStream.prototype.processLastPlay = function(track) {
  if (!this.lastPlay) {
    this.lastPlay = track;
    this.emit('lastPlayed', track);
    return;
  }

  var sameTrack = (this.lastPlay.name == track.name);
  if (!sameTrack) {
    this.lastPlay = track;
    this.emit('scrobbled', track);
  }
};

RecentTracksStream.prototype.stream = function() {
  var that = this;

  var check = function() {
    that.lastfm.readRequest(that.params, false, function(chunk) {
        that.parser.receive(chunk);
    });
    setTimeout(check, that.rate * 1000);
  }

  check();
};
