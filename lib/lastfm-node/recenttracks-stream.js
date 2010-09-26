var http = require('http');
var EventEmitter = require('events').EventEmitter;
var RecentTracksParser = require('./recenttracks-parser').RecentTracksParser;

RecentTracksStream = function(lastfm, options) {
  EventEmitter.call(this);
  var that = this;
  this.lastfm = lastfm;
  this.user = options.user;
  this.lastPlay = null;
  this.nowPlaying = null;
  this.rate = 10;
  this.parser = options.parser || new RecentTracksParser();

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

  //this.stream();
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

RecentTracksStream.prototype.buildParams = function() {
  function addParam(key, value) {
    if(params != '') { params += '&'; }
    params += key + '=' + value;
  }

  var params = this.lastfm.buildParams();
  addParam('method', 'user.getrecenttracks');
  addParam('user', this.user);
  addParam('limit', '1');
  return params;
}

RecentTracksStream.prototype.requestUrl = function() {
  return this.lastfm.url + '?' + this.buildParams();
};

RecentTracksStream.prototype.stream = function() {
  var check = function() {
      var request = connection.request('GET', that.requestUrl(), { 'host': that.lastfm.host });
    request.end();
    request.on('response', function(response) {
      response.on('data', function(chunk) {
        that.parser.receive(chunk);
      });
      setTimeout(check, that.rate * 1000);
    });
  }
  
  var that = this;
  var connection = http.createClient(80, that.lastfm.host);
  check();
};
