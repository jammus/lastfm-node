if (global.GENTLY_HIJACK) require = GENTLY_HIJACK.hijack(require);

var http = require("http");
var querystring = require('querystring');
var EventEmitter = require("events").EventEmitter;
var _ = require("underscore");
var crypto = require("crypto");
var utils = require("./utils");

var LastFmRequest = module.exports = function(lastfm, method, params) {
  var that = this;
  params = params || {};

  EventEmitter.call(this);
  utils.registerHandlers(this, params.handlers);

  var requestParams = filterParams(params);
  requestParams.method = method;
  requestParams.api_key = requestParams.api_key || lastfm.api_key;
  requestParams.format = requestParams.format || lastfm.format;
  
  var isWriteRequest = params.write || isWriteMethod(method);
  var requiresSignature = isWriteRequest || params.signed || isSignedMethod(method);
  if (requiresSignature) {
    requestParams = signParams(requestParams);
  }
  var data = querystring.stringify(requestParams);

  var httpVerb = isWriteRequest ? "POST" : "GET";
  sendRequest(httpVerb, lastfm.host, lastfm.url, data);

  function sendRequest(httpVerb, host, url, data) {
    var port = 80;
    var connection = http.createClient(port, host); 
    connection.on("error", function(error) {
      that.emit("error", error);
    });
    if (httpVerb == "GET") {
      url += "?" + data;
    }
    var headers = requestHeaders(httpVerb, host, data);
    var request = connection.request(httpVerb, url, headers);
    if (httpVerb == "POST") {
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

  function requestHeaders(httpVerb, host, data) {
    var headers = {
      host: host
    };
    headers["User-Agent"] = lastfm.useragent;
    if (httpVerb == "POST") {
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

  function signParams(params) {
    var sig = "";
    Object.keys(params).sort().forEach(function(key) {
      if (key != "format") sig += key + params[key];
    });
    sig += lastfm.secret;
    params.api_sig = crypto.createHash("md5").update(sig, "utf8").digest("hex");
    return params;
  };
};

LastFmRequest.prototype = Object.create(EventEmitter.prototype);
