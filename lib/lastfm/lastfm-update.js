var _ = require("underscore")
  , LastFmBase = require("./lastfm-base")
  , retryOnErrors = [
      11,                 // Service offline
      16,                 // Temporarily unavailable
      29                  // Rate limit exceeded
    ]
  , retrySchedule = [
      10 * 1000,          // 10 seconds
      30 * 1000,          // 30 seconds
      60 * 1000,          // 1 minute
      5 * 60 * 1000,      // 5 minutes
      15 * 60 * 1000,     // 15 minutes
      30 * 60 * 1000      // 30 minutes
    ];

var LastFmUpdate = function(lastfm, method, session, options) {
  var that = this;
  options = options || { };
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

    var retryCount = 0
      , params = buildRequestParams(options)
      , requestMethod = method == "scrobble" ? "track.scrobble" : "track.updateNowPlaying";
    makeRequest();

    function makeRequest() {
      var request = lastfm.request(requestMethod, params);
      request.on("error", errorCallback);
      request.on("success", successCallback);
    }

    function successCallback(response) {
      if (response) {
        that.emit("success", options.track);
      }
    }

    function errorCallback(error) {
      if (shouldRetry(error)) {
        that.emit("retrying");
        var delay = retrySchedule[Math.min(retryCount++, retrySchedule.length - 1)];
        that.scheduleCallback(makeRequest, delay);
        return;
      }
      bubbleError(error);
    }

    function shouldRetry(error) {
      return method == "scrobble" && _(retryOnErrors).include(error.error)
    }
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

