var http = require('http');
var EventEmitter = require('events').EventEmitter;

LastFmSession = function(lastfm) {
  EventEmitter.call(this);
  this.lastfm = lastfm;
};

LastFmSession.prototype = Object.create(EventEmitter.prototype);

LastFmSession.prototype.authorise = function(token) {
  if (!token) {
    this.emit('error', new Error('No token supplied'));
    return;
  }

  var that = this;
  this.lastfm.createRequest({token: token, method: 'auth.getsession'}, true, function(data) {
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
