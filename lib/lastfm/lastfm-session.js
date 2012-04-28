var LastFmBase = require("./lastfm-base");

var LastFmSession = function(lastfm, options, key) {
  options = options || { };
  var that = this,
      retry = true;

  LastFmBase.call(this);
  if (typeof options !== "object") {
    this.user = options || "";
    this.key = key || "";
  }
  else {
    this.user = options.user || "";
    this.key = options.key || "";
  }

  if (options.token) {
    authorise(options.token, options);
  }

  /**
   * @deprecated
   */
  this.authorise = function(token, options) {
    authorise(token, options);
  };

  this.isAuthorised = function() {
    return isAuthorised();
  }

  this.cancel = function() {
    retry = false;
  }

  function authorise(token, options) {
    options = options || { };

    registerEventHandlers(options);

    validateToken(token, options);
  }

  function registerEventHandlers(options) {
    that.registerHandlers(options.handlers);
  }

  function validateToken(token, options) {
    options = options || { };
    if (!token) {
      that.emit("error", new Error("No token supplied"));
      return;
    }

    var params = { token: token },
        request = lastfm.request("auth.getsession", params);

    request.on("success", authoriseSession);

    request.on("error", function handleError(error) {
      if (shouldBeRetried(error)) {
        if (!retry) {
          return;
        }
        var delay = options.retryInterval || 10000;
        that.emit("retrying", {
          error: error.error,
          message: error.message,
          delay: delay
        });
        that.scheduleCallback(function() {
          validateToken(token, options);
        }, delay);
        return;
      }
      bubbleError(error);
    });
  }

  function shouldBeRetried(error) {
    return error.error == 14 ||
        error.error == 16 ||
        error.error == 11;
  }

  function isAuthorised() {
    return that.key !== '';
  }

  function authoriseSession(result) {
    if (!result.session) {
      that.emit("error", new Error("Unexpected error"));
      return;
    }
    setSessionDetails(result.session);
    that.emit("authorised", that);
    that.emit("success", that);
  }

  function setSessionDetails(session) {
    that.user = session.name;
    that.key = session.key;
  }

  function bubbleError(error) {
    that.emit("error", error);
  }
};

LastFmSession.prototype = Object.create(LastFmBase.prototype);

module.exports = LastFmSession;
