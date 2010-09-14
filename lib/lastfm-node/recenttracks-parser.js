var sys = require('sys');
var http = require('http');

var RecentTrackParser = exports.RecentTracksParser = function(){
};

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

