var EventEmitter = require('events').EventEmitter;

var Client = exports.Client = function(port, host) {
  EventEmitter.call(this);
  this.port = port;
  this.host = host;
};

Client.prototype = Object.create(EventEmitter.prototype);

Client.prototype.request = function() {
    return new ClientRequest();
};

var ClientRequest = exports.ClientRequest = function() {
  EventEmitter.call(this);
};

ClientRequest.prototype = Object.create(EventEmitter.prototype);

ClientRequest.prototype.write = function() {
};

ClientRequest.prototype.end = function() {
};

var ClientResponse = exports.ClientResponse = function() {
  EventEmitter.call(this);
};

ClientResponse.prototype = Object.create(EventEmitter.prototype);

var LastFmRequest = exports.LastFmRequest = function(connection, url) {
  EventEmitter.call(this);
  this.connection = connection;
  this.url = url;
};

LastFmRequest.prototype = Object.create(EventEmitter.prototype);
