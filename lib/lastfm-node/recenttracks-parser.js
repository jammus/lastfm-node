var RecentTrackParser = exports.RecentTracksParser = function(){
  this.buffer = '';
};

RecentTrackParser.TERMINATOR = '\n';
RecentTrackParser.TERMINATOR_LENGTH = 1;

RecentTrackParser.prototype.receive = function (data) {
  this.buffer += data;
  if (this.buffer.substr(this.buffer.length - RecentTrackParser.TERMINATOR_LENGTH) == RecentTrackParser.TERMINATOR) {
    var track = this.parse(this.buffer);
    this.buffer = '';
    return track;
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

