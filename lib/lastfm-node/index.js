var sys = require('sys');
var http = require('http');
var EventEmitter = require('events').EventEmitter;
var RecentTracksParser = require('./recenttracks-parser').RecentTracksParser;

var LastFmNode = exports.LastFmNode = function(options){
  EventEmitter.call(this);
  if (!options) options = {};
  this.api_key = options.api_key;
  this.user = options.user;
  this.url = '/2.0';
  this.host = 'ws.audioscrobbler.com';
  this.rate = 10;
  this.lastPlay = null;
  this.nowPlaying = null;
  this.parser = options.parser || new RecentTracksParser();

  var that = this;
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

LastFmNode.prototype = Object.create(EventEmitter.prototype);

LastFmNode.prototype.processNowPlaying = function(track) {
  var sameTrack = (this.nowPlaying && this.nowPlaying.name == track.name);
  if (!sameTrack) {
    this.nowPlaying = track;
    this.emit('nowPlaying', track);
  }
};

LastFmNode.prototype.processLastPlay = function(track) {
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

LastFmNode.prototype.buildParams = function() {
  function addParam(key, value) {
    if(params != '') { params += '&'; }
    params += key + '=' + value;
  }

  var params = '';
  addParam('method', 'user.getrecenttracks');
  addParam('api_key', this.api_key);
  addParam('user', this.user);
  addParam('format', 'json');
  addParam('limit', '1');

  return params;
};

LastFmNode.prototype.requestUrl = function() {
  return this.url + '?' + this.buildParams();
};

LastFmNode.prototype.stream = function() {
  var check = function() {
    var request = lastfm.request('GET', self.requestUrl(),
      {'host': self.host});
    request.end();
    request.on('response', function(response) {
      response.on('data', function(chunk) {
        self.parser.receive(chunk);
      });
      setTimeout(check, self.rate * 1000);
    });
  }
  
  var self = this;
  var lastfm = http.createClient(80, self.host);
  check();
};
