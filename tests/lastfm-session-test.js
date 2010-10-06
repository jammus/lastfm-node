var LastFmNode = require('lastfm').LastFmNode;
var assert = require('assert');
var sys = require('sys');
var ntest = require('ntest');
var FakeData = require('./TestData.js').FakeData;

function setupLastFmSessionFixture(context) {
  var that = context;

  context.params = null;
  context.signed = false;
  context.returndata = '{}';

  var MockLastFm = function() {};
  MockLastFm.prototype = Object.create(LastFmNode.prototype);
  MockLastFm.prototype.createRequest = function(params, signed, callback) {
    that.params = params;
    that.signed = signed;
    callback(that.returndata); 
  };
  context.lastfm = new MockLastFm();

  context.authorisedSession = null;
  context.error = null;

  context.session = new LastFmSession(context.lastfm);
  context.session.addListener('authorised', function(session) {
    that.authorisedSession = session;
  });

  context.session.addListener('error', function(error) {
    that.error = error;    
  });

  context.whenReceiving = function(returndata) {
    that.returndata = returndata;
    that.session.authorise('token');
  };

  context.expectError = function(errorMessage) {
    assert.ok(that.error);
    assert.equal(errorMessage, that.error.message);
  };
};

ntest.describe("a new LastFmSession");
ntest.before(function() {
   setupLastFmSessionFixture(this);
});

ntest.it("has no session key", function() {
  assert.ok(!this.key);
});

ntest.it("has no user", function() {
  assert.ok(!this.user);
});

ntest.describe("a LastFmSession authorisation request")
ntest.before(function() {
   setupLastFmSessionFixture(this);
});

ntest.it("emits error when no token supplied", function() {
  this.session.authorise(); 
  this.expectError('No token supplied');
});

ntest.it("contains supplied token", function() {
  this.session.authorise('token');
  assert.equal('token', this.params.token);
});

ntest.it("uses getSession method", function() {
  this.session.authorise('token');
  assert.equal('auth.getsession', this.params.method);
});

ntest.it("is signed", function() {
  this.session.authorise('token');
  assert.ok(this.signed); 
});

ntest.describe("a completed LastFmSession authorisation request")
ntest.before(function() {
   setupLastFmSessionFixture(this);
});

ntest.it("emits error when authorisation not successful", function() {
  this.whenReceiving(FakeData.AuthorisationError);
  this.expectError('Invalid method signature supplied');
});

ntest.it("emits error when receiving unexpected return data", function() {
  this.whenReceiving(FakeData.SingleRecentTrack);
  this.expectError('Unexpected error');
});

ntest.it("emits authorised when successful", function() {
  this.whenReceiving(FakeData.SuccessfulAuthorisation);
  assert.ok(this.authorisedSession);
  assert.ok(!this.error);
});

ntest.it("updates session key and user when successful", function() {
  this.whenReceiving(FakeData.SuccessfulAuthorisation);
  assert.equal('username', this.session.user);
  assert.equal('sessionkey', this.session.key);
});
