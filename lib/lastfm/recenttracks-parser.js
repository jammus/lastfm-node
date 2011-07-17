var EventEmitter = require("events").EventEmitter;

var RecentTrackParser = module.exports = function(){
  EventEmitter.call(this);
};

RecentTrackParser.prototype = Object.create(EventEmitter.prototype);

RecentTrackParser.prototype.parse = function (data) {
  if (!data || !data.recenttracks || !data.recenttracks.track) {
    this.emit("error", new Error("Unknown object type: " + data));
    return;
  }
  this.emit("track", data.recenttracks.track);
};

