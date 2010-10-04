var sys = require('sys');
var http = require('http');
var querystring = require('querystring');
var crypto = require('crypto');

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

LastFmNode.prototype.requestUrl = function(additionalParams, signed) {
  var that = this;
  function copyKeys(source, destination) {
    if (!source) {
      return;
    }
    Object.keys(source).forEach(function(key) {
      destination[key] = source[key];
    });
  }

  function merge(a, b, c) {
    var c = {};
    copyKeys(a, c);
    copyKeys(b, c);
    return c;
  }

  function sign(params) {
    var signature = "";
    Object.keys(params).sort().forEach(function(key) {
      if (key != 'format') signature += key + params[key];
    });
    signature += that.secret;
    return crypto.createHash("md5").update(signature).digest("hex");
  }

  var params = merge(this.params, additionalParams);
  if (signed) {
    params.api_sig = sign(params); 
  }
  return this.url + '?' + querystring.stringify(params);
};

LastFmNode.prototype.createRequest = function(params, signed, callback) {
  var connection = http.createClient(80, this.host);
  var request = connection.request('GET', this.requestUrl(params, signed), { host: this.host });
  request.end();
  request.on('response', function(response) {
    response.on('data', callback);
  });
};

LastFmNode.prototype.createRecentTrackStream = function(options) {
  return new RecentTracksStream(this, options);
};

LastFmNode.prototype.createNewSession = function() {
  return new LastFmSession(this);
};
