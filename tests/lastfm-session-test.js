var LastFmNode = require('lastfm').LastFmNode;
var assert = require('assert');
var sys = require('sys');
var ntest = require('ntest');
var FakeData = require('./TestData.js').FakeData;

ntest.describe("session authorisation");
ntest.before(function() {
  var that = this;

  this.params = null;
  this.signed = false;
  this.returndata = '{}';

  var MockLastFm = function() {};
  MockLastFm.prototype = Object.create(LastFmNode.prototype);
  MockLastFm.prototype.createRequest = function(params, signed, callback) {
    that.params = params;
    that.signed = signed;
    callback(that.returndata); 
  };
  this.lastfm = new MockLastFm();

  this.authorisedSession = null;
  this.error = null;

  this.session = new LastFmSession(this.lastfm);
  this.session.addListener('authorised', function(session) {
    that.authorisedSession = session;
  });
  this.session.addListener('error', function(error) {
    that.error = error;    
  });
});

ntest.it("has no session key", function() {
  assert.ok(!this.key);
});

ntest.it("has no user", function() {
  assert.ok(!this.user);
});

ntest.it("emits error when no token supplied", function() {
  this.session.authorise(); 
  assert.ok(this.error);
  assert.equal('No token supplied', this.error.message);
});

ntest.it("authorisation request contains token", function() {
  this.session.authorise('token');
  assert.equal('token', this.params.token);
});

ntest.it("authorisation request method is getSession", function() {
  this.session.authorise('token');
  assert.equal('auth.getsession', this.params.method);
});

ntest.it("authorisation is a signed request", function() {
  this.session.authorise('token');
  assert.ok(this.signed); 
});

ntest.it("emits error when authorisation not successful", function() {
  this.returndata = FakeData.AuthorisationError; 
  this.session.authorise('token');
  assert.ok(this.error);
  assert.equal('Invalid method signature supplied', this.error.message);
});

ntest.it("emits error when receiving unexpected return data", function() {
  this.returndata = FakeData.SingleRecentTrack; 
  this.session.authorise('token');
  assert.ok(this.error);
  assert.equal('Unexpected error', this.error.message);
});

ntest.it("emits authorised when successful", function() {
  this.returndata = FakeData.SuccessfulAuthorisation;
  this.session.authorise('token');
  assert.ok(this.authorisedSession);
  assert.ok(!this.error);
});

ntest.it("updates session key and user when successful", function() {
  this.returndata = FakeData.SuccessfulAuthorisation;
  this.session.authorise('token');
  assert.equal('username', this.session.user);
  assert.equal('sessionkey', this.session.key);
});
