var LastFmBase = require("./lastfm-base");

var LastFmInfo = function(lastfm, type, options) {
  var that = this;
  options = options || {};
  LastFmBase.call(this);

  registerEventHandlers(options);
  requestInfo(type, options);

  function registerEventHandlers(options) {
    that.registerHandlers(options.handlers);
  }

  function requestInfo(type, options) {
    if (!type) {
      that.emit("error", new Error("Item type not specified"));
      return;
    }

    var params = that.filterParameters(options)
      , method = type + ".getinfo"
      , request = lastfm.request(method, params);
    request.on("success", success);
    request.on("error", error);
  }

  function success(response) {
    if (response[type]) {
      that.emit("success", response[type]);
      return;
    }
    that.emit("error", new Error("Unexpected error"));
  }
  
  function error(error) {
    that.emit("error", error);
  }
};

LastFmInfo.prototype = Object.create(LastFmBase.prototype);

module.exports = LastFmInfo;
