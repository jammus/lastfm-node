var EventEmitter = require("events").EventEmitter;

var RecentTrackParser = module.exports = function(){
  EventEmitter.call(this);
};

RecentTrackParser.prototype = Object.create(EventEmitter.prototype);

RecentTrackParser.prototype.parse = function (data) {
    if (!data || data == "") {
      this.emit("error", new Error("No data received"));
      return;
    }

    try {
      var json = JSON.parse(data);
    }
    catch(e) {
      this.emit("error", new Error("Unexpected data: " + data));
      return;
    }

    if (json.error) {
      this.emit("error", json.message);
      return;
    }

    if (!json.recenttracks || !json.recenttracks.track) {
      this.emit("error", new Error("Unknown object type: " + data));
      return;
    }

    this.emit("track", json.recenttracks.track);
};

