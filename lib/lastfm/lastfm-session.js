var LastFmBase = require("./lastfm-base");

var LastFmSession = function(lastfm, user, key) {
  var that = this;
  LastFmBase.call(this);
  user = user || "";
  key = key || "";

  this.user = user;

  this.key = key;

  this.authorise = function(token, options) {
    authorise(token, options);
  };

  this.isAuthorised = function() {
    return isAuthorised();
  }

  function authorise(token, options) {
    options = options || { };

    registerEventHandlers(options);

    validateToken(token);
  }

  function registerEventHandlers(options) {
    that.registerHandlers(options.handlers);
  }

  function validateToken(token) {
    if (!token) {
      that.emit("error", new Error("No token supplied"));
      return;
    }

    var params = { token: token },
        request = lastfm.request("auth.getsession", params);

    request.on("success", authoriseSession);

    request.on("error", bubbleError);
  }

  function isAuthorised() {
    return that.key && that.key !== '';
  }

  function authoriseSession(result) {
    if (!result.session) {
      that.emit("error", new Error("Unexpected error"));
      return;
    }
    setSessionDetails(result.session);
    that.emit("authorised", that);
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
