var http = require('http');
var EventEmitter = require('events').EventEmitter;

LastFmSession = function(lastfm) {
  EventEmitter.call(this);
  this.lastfm = lastfm;
  this.user = '';
  this.key = '';
};

LastFmSession.prototype = Object.create(EventEmitter.prototype);

LastFmSession.prototype.authorise = function(token) {
  if (!token) {
    this.emit('error', new Error('No token supplied'));
    return;
  }

  var that = this;
  this.lastfm.readRequest({token: token, method: 'auth.getsession'}, true, function(data) {
    var result = JSON.parse(data); 

    if (result.error) {
      that.emit('error', new Error(result.message));
      return;
    }

    if (result.session) {
      that.user = result.session.name;
      that.key = result.session.key;
      that.emit('authorised', that);
      return;
    } 

    that.emit('error', new Error('Unexpected error'));
  });
};

LastFmSession.prototype.updateNowPlaying = function(track) {
  if (!this.key) {
    this.emit('error', new Error('Session is not authorised'));
    return;
  }
  var that = this;
  this.buffer = '';
  this.lastfm.writeRequest({ method: 'user.updateNowPlaying', artist: track.artist['#text'], track: track.name, sk: this.key }, true, function(data) {
    var response = JSON.parse(data);
    if (!response.lfm) return;
    if (response.lfm['@status'] == "failed") {
      that.emit('error', new Error(response.lfm.error.$));
    }
    if (response.lfm['@status'] == "ok") {
      that.emit('success', null);
    }
  });
};

LastFmSession.prototype.scrobble = function(track, timestamp) {
  if (!this.key) {
    this.emit('error', new Error('Session is not authorised'));
    return;
  }

  if (!timestamp) {
    this.emit('error', new Error('Timestamp is required for scrobbling'));
    return;
  }

  var that = this;
  this.buffer = '';
  this.lastfm.writeRequest({ method: 'track.scrobble', artist: track.artist['#text'], track: track.name, sk: this.key, timestamp: timestamp }, true, function(data) {
    var response = JSON.parse(data);
    if (!response.lfm) return;
    if (response.lfm['@status'] == "failed") {
      that.emit('error', new Error(response.lfm.error.$));
    }
    if (response.lfm['@status'] == "ok") {
      that.emit('success', null);
    }
  });
};
