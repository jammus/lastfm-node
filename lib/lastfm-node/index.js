var sys = require('sys');
require('./recenttracks-stream');

var LastFmNode = exports.LastFmNode = function(options){
  if (!options) options = {};
  this.api_key = options.api_key;
  this.url = '/2.0';
  this.host = 'ws.audioscrobbler.com';

  var that = this;
};


LastFmNode.prototype.buildParams = function() {
  function addParam(key, value) {
    if(params != '') { params += '&'; }
    params += key + '=' + value;
  }

  var params = '';
  addParam('api_key', this.api_key);
  addParam('format', 'json');

  return params;
};

LastFmNode.prototype.getRecentTrackStream = function(options) {
  return new RecentTracksStream(this, options);
};
