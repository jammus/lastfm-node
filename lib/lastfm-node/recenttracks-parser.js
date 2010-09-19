var EventEmitter = require('events').EventEmitter;

var RecentTrackParser = exports.RecentTracksParser = function(){
  EventEmitter.call(this);
  this.buffer = '';
};

RecentTrackParser.TERMINATOR = '\n';

RecentTrackParser.prototype = Object.create(EventEmitter.prototype);

RecentTrackParser.prototype.receive = function (data) {
  this.buffer += data;
  var index = this.buffer.length - RecentTrackParser.TERMINATOR.length;
  var terminated = this.buffer.substr(index) == RecentTrackParser.TERMINATOR;
  if (!terminated)
    return;

  try {
    var track = this.parse(this.buffer);
    this.emit('track', track);
  }
  catch(e) {
    this.emit('error', e);
  }
  finally {
    this.buffer = '';
  }
}

RecentTrackParser.prototype.parse = function (data) {
    if (!data || data == '') {
      throw "Unexpected input";
    }

    var json = JSON.parse(data);
    if (json.recenttracks.track instanceof Array)
      return json.recenttracks.track[0];
 
    return json.recenttracks.track; 
};

