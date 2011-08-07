var _ = require("underscore")
  , LastFmBase = require("./lastfm-base");

var LastFmUpdate = function(lastfm, method, session, options) {
  var that = this;
  options = options || {};
  LastFmBase.call(this);

  registerEventHandlers(options);
    
  if (!session.isAuthorised()) {
    this.emit("error", new Error("Session is not authorised"));
    return;
  }
  if (method !== "scrobble" && method !== "nowplaying") {
    return;
  }

  update(method, options); 

  function registerEventHandlers(options) {
    if (options.error) {
      that.on("error", options.error);
    }
    if (options.success) {
      that.on("success", options.success);
    }
    that.registerHandlers(options.handlers);
  }
  
  function update(method, options) {
    if (method == "scrobble" && !options.timestamp) {
      that.emit("error", new Error("Timestamp is required for scrobbling"));
      return;
    }

    var params = buildRequestParams(options),
        requestMethod = method == "scrobble" ? "track.scrobble" : "track.updateNowPlaying",
        request = lastfm.request(requestMethod, params);
    request.on("success", handleResponse);
    request.on("error", bubbleError);
  }

  function handleResponse(response) {
    if (!response) return;
    that.emit("success", options.track);
  }

  function bubbleError(error) {
    that.emit("error", error);
  }

  function buildRequestParams(params) {
    var requestParams = that.filterParameters(params, ["error", "success", "handlers"]);
    requestParams.sk = session.key;
    return requestParams;
  }
}

LastFmUpdate.prototype = Object.create(LastFmBase.prototype);

module.exports = LastFmUpdate;

