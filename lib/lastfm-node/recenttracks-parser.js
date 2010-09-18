var EventEmitter = require('events').EventEmitter;

var RecentTrackParser = exports.RecentTracksParser = function(){
  EventEmitter.call(this);
  this.buffer = '';
};

RecentTrackParser.TERMINATOR = '\n';
RecentTrackParser.TERMINATOR_LENGTH = 1;

RecentTrackParser.prototype = Object.create(EventEmitter.prototype);

RecentTrackParser.prototype.receive = function (data) {
  this.buffer += data;
  if (this.buffer.substr(this.buffer.length - RecentTrackParser.TERMINATOR_LENGTH) == RecentTrackParser.TERMINATOR) {
    var track = this.parse(this.buffer);
    this.buffer = '';
    if (!track) {
      this.emit('error');
      return;
    }
    this.emit('track', track);
  }
}

RecentTrackParser.prototype.parse = function (data) {
  try {
    var json = JSON.parse(data);
    if (json.recenttracks.track instanceof Array)
      return json.recenttracks.track[0];
 
    return json.recenttracks.track; 
  }
  catch(e) {
    return null;
  }
};

