var _ = require("underscore")
  , LastFmBase = require("./lastfm-base");

var LastFmUpdate = function(lastfm, method, session, options) {
  var that = this;
  options = options || { };
  LastFmBase.call(this);

  var retryOnErrors = [
      11, // Service offline
      16, // Temporarily unavailable
      29  // Rate limit exceeded
  ];

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

    var params = buildRequestParams(options)
      , requestMethod = method == "scrobble" ? "track.scrobble" : "track.updateNowPlaying"
      , request = lastfm.request(requestMethod, params);
    request.on("success", handleResponse);
    request.on("error", errorCallback);

    var retrySchedule = [
          10 * 1000,
          30 * 1000,
          60 * 1000,
          5 * 60 * 1000,
          15 * 60 * 1000,
          30 * 60 * 1000
        ]
      , retryCount = 0;

    function errorCallback(error) {
      if (method == "scrobble" && _(retryOnErrors).include(error.error)) {
        that.emit("retrying");
        var delay = retrySchedule[Math.min(retryCount++, retrySchedule.length - 1)];
        that.scheduleCallback(retryRequest, delay);
        return;
      }
      bubbleError(error);
    }

    function retryRequest() {
      var request = lastfm.request(requestMethod, params);
      request.on("error", errorCallback);
      request.on("success", handleResponse);
    }
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

