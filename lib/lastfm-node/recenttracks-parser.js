var sys = require('sys');
var http = require('http');

var RecentTrackParser = exports.RecentTracksParser = function(){
  this.buffer = '';
};

RecentTrackParser.prototype.parse = function (data) {
  this.buffer += data;
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

