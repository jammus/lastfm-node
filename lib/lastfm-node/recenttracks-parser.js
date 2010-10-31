var EventEmitter = require('events').EventEmitter;

var RecentTrackParser = exports.RecentTracksParser = function(){
  EventEmitter.call(this);
  this.buffer = '';
};

RecentTrackParser.prototype = Object.create(EventEmitter.prototype);

RecentTrackParser.prototype.parse = function (data) {
    if (!data || data == '') {
      this.emit('error', new Error("Unexpected input"));
      return;
    }

    var json = JSON.parse(data);
    if (!json.recenttracks) {
      this.emit('error', new Error("Unknown object type"));
      return;
    }

    this.emit('track', json.recenttracks.track);
};

