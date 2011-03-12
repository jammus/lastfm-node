if (global.GENTLY_HIJACK) require = GENTLY_HIJACK.hijack(require);

var http = require("http");
var querystring = require('querystring');
var EventEmitter = require("events").EventEmitter;
var _ = require("underscore");
var crypto = require("crypto");

var LastFmRequest = module.exports = function(lastfm, method, params) {
  var that = this;
  params = params || {};
  var requestParams = {};
  _(Object.keys(params)).each(function(key) {
    if (key != "handlers" && key != "signed" && key != "write") {
      requestParams[key] = params[key];
    }
  });
  if (typeof(params.handlers) == "object") {
    _(Object.keys(params.handlers)).each(function(key) {
      that.on(key, params.handlers[key]);
    });
  }
  requestParams.method = method;
  requestParams.api_key = requestParams.api_key || lastfm.params.api_key;
  requestParams.format = requestParams.format || lastfm.params.format;
  
  var signed = isSignedMethod(method) || params.signed;
  if (signed) {
    requestParams.api_sig = signature(requestParams);
  }
  var connection = http.createClient(80, lastfm.host); 

  var url = lastfm.url;
  var httpMethod = params.write ? "POST" : "GET";
  if (httpMethod == "GET") {
    url += ("?" + querystring.stringify(requestParams));
  }
  EventEmitter.call(this);

  connection.on("error", function(error) {
    that.emit("error", error);
  });

  var headers = requestHeaders(httpMethod, querystring.stringify(requestParams));
  var request = connection.request(httpMethod, url, headers);
  if (httpMethod == "POST") {
    request.write(querystring.stringify(requestParams));
  }
  request.on("response", handleResponse);
  request.end();

  function isSignedMethod(method) {
    return method == "auth.getsession";
  }

  function requestHeaders(httpMethod, body) {
    var headers = {
      host: connection.host
    };

    if (httpMethod == "POST") {
      headers["Content-Length"] = body.length;
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

  function signature(params) {
    var sig = "";
    Object.keys(params).sort().forEach(function(key) {
      if (key != "format") sig += key + params[key];
    });
    sig += lastfm.secret;
    return crypto.createHash("md5").update(sig, "utf8").digest("hex");
  };
};

LastFmRequest.prototype = Object.create(EventEmitter.prototype);
