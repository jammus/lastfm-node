if (global.GENTLY_HIJACK) require = GENTLY_HIJACK.hijack(require);

var http = require("http")
  , querystring = require('querystring')
  , _ = require("underscore")
  , crypto = require("crypto")
  , LastFmBase = require("./lastfm-base");

var WRITE_METHODS = ["album.addtags", "album.removetag", "album.share",
        "artist.addtags", "artist.removetag", "artist.share", "artist.shout",
        "event.attend", "event.share", "event.shout",
        "library.addalbum", "library.addartist", "library.addtrack",
        "library.removealbum", "library.removeartist", "library.removetrack", "library.removescrobble",
        "playlist.addtrack", "playlist.create",
        "radio.tune",
        "track.addtags", "track.ban", "track.love", "track.removetag",
        "track.scrobble", "track.share", "track.unban", "track.unlove",
        "track.updatenowplaying",
        "user.shout"],
    SIGNED_METHODS = ["auth.getmobilesession", "auth.getsession", "auth.gettoken",
        "radio.getplaylist",
        "user.getrecentstations", "user.getrecommendedartists", "user.getrecommendedevents"];

var LastFmRequest = module.exports = function(lastfm, method, params) {
  var that = this;
  LastFmBase.call(this);
  params = params || {};

  that.registerHandlers(params.handlers);

  sendRequest(lastfm.host, lastfm.url, params);

  function sendRequest(host, url, params) {
    var httpVerb = isWriteRequest() ? "POST" : "GET"
    var requestParams = buildRequestParams(params);
    var data = querystring.stringify(requestParams);
    if (httpVerb == "GET") {
      url += "?" + data;
    }
    var options = {
        host: host,
        port: 80,
        path: url,
        method: httpVerb,
        headers: requestHeaders(httpVerb, host, data)
    };
    var req = http.request(options, chunkedResponse);
    req.on("error", function(error) {
        that.emit("error", error);
    });
    if (httpVerb == "POST") {
        req.write(data);
    }
    req.end()
  }

  function buildRequestParams(params) {
    var requestParams = that.filterParameters(params, ["signed", "write"]);
    requestParams.method = method;
    requestParams.api_key = requestParams.api_key || lastfm.api_key;
    requestParams.format = requestParams.format || lastfm.format;
    if (params.track && typeof params.track === "object") {
      requestParams.artist = params.track.artist["#text"];
      requestParams.track = params.track.name;
      if (params.track.mbid) {
        requestParams.mbid = params.track.mbid;
      }
      if (params.track.album) {
        requestParams.album = requestParams.album || params.track.album["#text"];
      }
    }
    if (requiresSignature()) {
      requestParams.api_sig = createSignature(requestParams, lastfm.secret);
    }
    return requestParams;
  }

  function requiresSignature() {
    return params.signed || isWriteRequest() || isSignedMethod(method);
  }

  function isWriteRequest() {
    return params.write || isWriteMethod(method);
  }

  function isSignedMethod(method) {
    return method && _(SIGNED_METHODS).include(method.toLowerCase());
  }

  function isWriteMethod(method) {
    return method && _(WRITE_METHODS).include(method.toLowerCase());
  }

  function requestHeaders(httpVerb, host, data) {
    var headers = {
      "User-Agent": lastfm.useragent
    };

    if (httpVerb == "POST") {
      headers["Content-Length"] = data.length;
      headers["Content-Type"] = "application/x-www-form-urlencoded";
    }

    return headers;
  }

  function chunkedResponse(response) {
    var data = "";
    response.on("data", function(chunk) {
        data += chunk.toString("utf8");
    });
    response.on("end", function() {
      if (lastfm.format !== "json") {
        that.emit("success", data);
        return;
      }
      try {
        var json = JSON.parse(data);
        if (json.error) {
          that.emit("error", json);
          return;
        }
        that.emit("success", json);
      }
      catch(e) {
        that.emit("error", e)
      }
    });
  }

  function createSignature(params, secret) {
    var sig = "";
    Object.keys(params).sort().forEach(function(key) {
      if (key != "format") {
        var value = typeof params[key] !== "undefined" && params[key] !== null ? params[key] : "";
        sig += key + value;
      }
    });
    sig += secret;
    return crypto.createHash("md5").update(sig, "utf8").digest("hex");
  }
};

LastFmRequest.prototype = Object.create(LastFmBase.prototype);
