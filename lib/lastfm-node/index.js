var sys = require('sys');
var http = require('http');
var querystring = require('querystring');
var crypto = require('crypto');

require('./recenttracks-stream');
require('./lastfm-session');

var LastFmNode = exports.LastFmNode = function(options){
  if (!options) options = {};
  this.url = '/2.0';
  this.writeUrl = '/2.0/';
  this.host = 'ws.audioscrobbler.com';
  this.writeHost = 'post.audioscrobbler.com';
  this.secret = options.secret || '';
  this.params =  {
    format : "json",
    api_key : options.api_key 
  };
  var that = this;
};

LastFmNode.prototype.mergeParams = function(a, b) {
  function copyKeys(source, destination) {
    if (!source) {
      return;
    }
    Object.keys(source).forEach(function(key) {
      destination[key] = source[key];
    });
  }

  var c = {};
  copyKeys(a, c);
  copyKeys(b, c);
  return c;
};

LastFmNode.prototype.signature = function(params, includeFormat) {
  var sig = "";
  Object.keys(params).sort().forEach(function(key) {
    if (key != 'format' || includeFormat) sig += key + params[key];
  });
  sig += this.secret;
  return crypto.createHash("md5").update(sig).digest("hex");
};

LastFmNode.prototype.requestUrl = function(additionalParams, signed) {
  var params = this.mergeParams(this.params, additionalParams);
  if (signed) {
    params.api_sig = this.signature(params); 
  }
  return this.url + '?' + querystring.stringify(params);
};

LastFmNode.prototype.readRequest = function(params, signed, callback) {
  var connection = http.createClient(80, this.host);
  var request = connection.request('GET', this.requestUrl(params, signed), { host: this.host });
  request.end();
  request.on('response', function(response) {
    response.on('data', callback);
  });
};

LastFmNode.prototype.writeRequest = function(params, signed, callback) {
  var connection = http.createClient(80, this.writeHost);
  var writeParams = this.mergeParams(this.params, params);
  if (signed) {
    writeParams.api_sig = this.signature(writeParams, true);
  }
  var body = querystring.stringify(writeParams);
  var request = connection.request('POST', this.writeUrl, { host: this.writeHost, 'Content-Length': body.length, 'Content-Type': 'application/x-www-form-urlencoded' });
  request.write(body);
  request.end();
  request.on('response', function(response) {
    response.on('data', callback);
  });
};

LastFmNode.prototype.subscribe = function(user) {
  return new RecentTracksStream(this, user);
};

LastFmNode.prototype.session = function(user, key) {
  return new LastFmSession(this);
};
