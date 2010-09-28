var sys = require('sys');
var http = require('http');
var querystring = require('querystring');
require('./recenttracks-stream');
require('./lastfm-session');

var LastFmNode = exports.LastFmNode = function(options){
  if (!options) options = {};
  this.url = '/2.0';
  this.host = 'ws.audioscrobbler.com';
  this.secret = options.secret || '';
  this.params =  {
    format : "json",
    api_key : options.api_key 
  };
  var that = this;
};

LastFmNode.prototype.buildParams = function() {
  return querystring.stringify(this.params);
};

LastFmNode.prototype.requestUrl = function(additionalParams) {
  var params = this.params;
  if (additionalParams) {
    Object.keys(additionalParams).forEach(function(key) {
      params[key] = additionalParams[key];
    });
  }
  return this.url + '?' + querystring.stringify(params);
};

LastFmNode.prototype.createRequest = function(params, callback) {
  var connection = http.createClient(80, this.host);
  var request = connection.request('GET', this.requestUrl(params), { host: this.host });
  request.end();
  request.on('response', function(response) {
    response.on('data', callback);
  });
};

LastFmNode.prototype.createRecentTrackStream = function(options) {
  return new RecentTracksStream(this, options);
};
