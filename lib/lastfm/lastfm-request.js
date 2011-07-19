if (global.GENTLY_HIJACK) require = GENTLY_HIJACK.hijack(require);

var http = require("http"),
    querystring = require('querystring'),
    EventEmitter = require("events").EventEmitter,
    _ = require("underscore"),
    crypto = require("crypto"),
    utils = require("./utils");

var LastFmRequest = module.exports = function(lastfm, method, params) {
  var that = this;
  EventEmitter.call(this);

  params = params || {};

  registerEventHandlers(params.handlers);

  sendRequest(lastfm.host, lastfm.url, params);

  function registerEventHandlers(handlers) {
    utils.registerHandlers(that, handlers);
  }

  function sendRequest(host, url, params) {
    var httpVerb = isWriteRequest() ? "POST" : "GET",
        port = 80,
        connection = http.createClient(port, host),
        requestParams = buildRequestParams(params),
        data = querystring.stringify(requestParams);

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

  function buildRequestParams(params) {
    var requestParams = removeSpecialParameters(params);
    requestParams.method = method;
    requestParams.api_key = requestParams.api_key || lastfm.api_key;
    requestParams.format = requestParams.format || lastfm.format;
    if (requiresSignature()) {
      requestParams = signParams(requestParams);
    }
    return requestParams;
  }

  function requiresSignature() {
    return isWriteRequest() || params.signed || isSignedMethod(method);
  }

  function isWriteRequest() {
    return params.write || isWriteMethod(method);
  }

  function removeSpecialParameters(params) {
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
