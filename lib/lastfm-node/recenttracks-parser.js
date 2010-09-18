var sys = require('sys');
var http = require('http');

var RecentTrackParser = exports.RecentTracksParser = function(){
  this.buffer = '';
};

RecentTrackParser.TERMINATOR = '\n';
RecentTrackParser.TERMINATOR_LENGTH = 1;

RecentTrackParser.prototype.parse = function (data) {
  this.buffer += data;
  if (this.buffer.substr(this.buffer.length - RecentTrackParser.TERMINATOR_LENGTH) != RecentTrackParser.TERMINATOR) {
    return null;
  }
  try {
    var json = JSON.parse(this.buffer);
    this.buffer = ''; 
    if (json.recenttracks.track instanceof Array)
      return json.recenttracks.track[0];
 
    return json.recenttracks.track; 
  }
  catch(e) {
    return null;
  }
};

