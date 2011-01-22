var http = require('http');
var querystring = require('querystring');
var crypto = require("crypto");
var RecentTracksStream = require('lastfm/recenttracks-stream').RecentTracksStream;
var LastFmSession = require('lastfm/lastfm-session').LastFmSession;
var LastFmUpdate = require('lastfm/lastfm-update').LastFmUpdate;
var LastFmInfo = require('lastfm/lastfm-info').LastFmInfo;
var LastFmRequest = require('lastfm/lastfm-request').LastFmRequest;

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

LastFmNode.prototype.signature = function(params) {
  var sig = "";
  Object.keys(params).sort().forEach(function(key) {
    if (key != 'format') sig += key + params[key];
  });
  sig += this.secret;
  return crypto.createHash("md5").update(sig, "utf8").digest("hex");
};

LastFmNode.prototype.requestUrl = function(additionalParams, signed) {
  var params = this.mergeParams(this.params, additionalParams);
  if (signed) {
    params.api_sig = this.signature(params); 
  }
  return this.url + '?' + querystring.stringify(params);
};

LastFmNode.prototype.read = function(params, signed, callback) {
  var connection = http.createClient(80, this.host);
  var request = new LastFmRequest(connection, this.url);
  request.on("success", function(data) {
    callback(data);
  });
  request.on("error", function(error) {
    console.log("Trapped error: " + error.message);
  });
};

LastFmNode.prototype.write = function(params, signed, callback) {
  var writeParams = this.mergeParams(this.params, params);
  if (signed) {
    writeParams.api_sig = this.signature(writeParams);
  }
  var body = querystring.stringify(writeParams);

  var connection = http.createClient(80, this.host);
  var request = new LastFmRequest(connection, this.url, body);
  request.on("success", function(data) {
    callback(data);
  });
  request.on("error", function(error) {
    console.log("Trapped error: " + error.message);
  });
};

LastFmNode.prototype.stream = function(user, options) {
  return new RecentTracksStream(this, user, options);
};

LastFmNode.prototype.session = function(user, key) {
  return new LastFmSession(this, user, key);
};

LastFmNode.prototype.info = function(type, options) {
  return new LastFmInfo(this, type, options);
};

LastFmNode.prototype.update = function(method, session, options) {
  return new LastFmUpdate(this, method, session, options);
};
