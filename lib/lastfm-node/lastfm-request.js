if (global.GENTLY_HIJACK) require = GENTLY_HIJACK.hijack(require);

var http = require("http");
var querystring = require('querystring');
var EventEmitter = require("events").EventEmitter;
var _ = require("underscore");
var crypto = require("crypto");
var utils = require("lastfm/utils");

var LastFmRequest = module.exports = function(lastfm, method, params) {
  var that = this;
  params = params || {};

  EventEmitter.call(this);
  utils.registerHandlers(this, params.handlers);

  var requestParams = filterParams(params);
  requestParams.method = method;
  requestParams.api_key = requestParams.api_key || lastfm.params.api_key;
  requestParams.format = requestParams.format || lastfm.params.format;
  
  var isWriteRequest = params.write || isWriteMethod(method);
  var requiresSignature = isWriteRequest || params.signed || isSignedMethod(method);
  if (requiresSignature) {
    requestParams.api_sig = generateSignatureHash(requestParams);
  }
  var data = querystring.stringify(requestParams);

  var url = lastfm.url;
  var httpMethod = isWriteRequest ? "POST" : "GET";
  if (httpMethod == "GET") {
    url += "?" + data;
  }

  doRequest(lastfm.host, httpMethod, data);

  function doRequest(host, method, data) {
    var port = 80;
    var connection = http.createClient(port, host); 
    var headers = generateRequestHeaders(method, host, data);
    connection.on("error", function(error) {
      that.emit("error", error);
    });
    var request = connection.request(method, url, headers);
    if (method == "POST") {
      request.write(data);
    }
    request.on("response", handleResponse);
    request.end();
  }

  function filterParams(params) {
    var paramsBlackList = ["handlers", "signed", "write"];
    var filteredParams = {};
    _(Object.keys(params)).each(function(key) {
      if (!_(paramsBlackList).include(key)) {
        filteredParams[key] = params[key];
      }
    });
    return filteredParams;
  }

  function isSignedMethod(method) {
    var signedMethods = ["auth.getmobilesession", "auth.getsession", "auth.gettoken",
    "radio.getplaylist"];
    return method && _(signedMethods).include(method.toLowerCase());
  }

  function isWriteMethod(method) {
    var writeMethods = ["album.addtags", "album.removetag", "album.share",
    "artist.addtags", "artist.removetag", "artist.share", "artist.shout",
    "event.attend", "event.share", "event.shout",
    "library.addalbum", "library.addartist", "library.addtrack",
    "playlist.addtrack", "playlist.create",
    "radio.tune",
    "track.addtags", "track.ban", "track.love", "track.removetag",
    "track.scrobble", "track.share", "track.unban", "track.unlove",
    "track.updatenowplaying",
    "user.shout"];
    return method && _(writeMethods).include(method.toLowerCase());
  }

  function generateRequestHeaders(httpMethod, host, data) {
    var headers = {
      host: host
    };

    if (httpMethod == "POST") {
      headers["Content-Length"] = data.length;
      headers["Content-Type"] = "application/x-www-form-urlencoded";
    }

    return headers;
  }

  function handleResponse(response) {
    var data = "";
    response.on("data", function(chunk) {
        data += chunk.toString("utf8");
    });
    response.on("end", function() {
      that.emit("success", data);
    });
  }

  function generateSignatureHash(params) {
    var sig = "";
    Object.keys(params).sort().forEach(function(key) {
      if (key != "format") sig += key + params[key];
    });
    sig += lastfm.secret;
    return crypto.createHash("md5").update(sig, "utf8").digest("hex");
  };
};

LastFmRequest.prototype = Object.create(EventEmitter.prototype);
