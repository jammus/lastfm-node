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
  if (this.key == '') {
    this.emit('error', new Error('Session is not authorised'));
    return;
  }
  var that = this;
  this.buffer = '';
  this.lastfm.writeRequest({ method: 'user.updateNowPlaying', artist: track.artist['#text'], track: track.name, sk: this.key }, true, function(data) {
   });
};
