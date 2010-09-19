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
  this.parser = options.parser || new RecentTracksParser();

  self = this;
  this.parser.addListener('track', function(track) {
    if (this.lastPlay && this.lastPlay.name == track.name) {
      return;
    }

    this.lastPlay = track;
    if (track['@attr'] && track['@attr']['nowplaying']) {
      self.emit('nowPlaying', track);
      return;
    }

    self.emit('lastPlayed', track);
  });

  this.parser.addListener('error', function(error) {
    self.emit('error', error);
  });
};

LastFmNode.prototype = Object.create(EventEmitter.prototype);

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
