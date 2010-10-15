var LastFmNode = require('lastfm').LastFmNode;
var assert = require('assert');
var sys = require('sys');
var ntest = require('ntest');
var FakeData = require('./TestData.js').FakeData;
var FakeTracks = require('./TestData.js').FakeTracks;

function setupLastFmSessionFixture(context) {
  var that = context;

  context.params = null;
  context.signed = false;
  context.returndata = '{}';

  var MockLastFm = function() {};
  MockLastFm.prototype = Object.create(LastFmNode.prototype);
  MockLastFm.prototype.readRequest = function(params, signed, callback) {
    that.params = params;
    that.signed = signed;
    callback(that.returndata); 
  };

  MockLastFm.prototype.writeRequest = function(params, signed, callback) {
    this.readRequest(params, signed, callback);
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

  context.expectError = function(errorMessage) {
    assert.ok(that.error);
    assert.equal(errorMessage, that.error.message);
  };
};

ntest.describe("a new LastFmSession");
ntest.before(function() {
   this.session = new LastFmSession(new LastFmNode());
});

ntest.it("has no session key", function() {
  assert.ok(!this.key);
});

ntest.it("has no user", function() {
  assert.ok(!this.user);
});

ntest.it("can configure key and user", function() {
  var session = new LastFmSession(new LastFmNode(), 'user', 'sessionkey');
  assert.equal('user', session.user);
  assert.equal('sessionkey', session.key);
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
   var that = this;

   setupLastFmSessionFixture(this);

   this.whenResponseIs = function(returndata) {
     that.returndata = returndata;
     that.session.authorise('token');
   };
});

ntest.it("emits error when authorisation not successful", function() {
  this.whenResponseIs(FakeData.AuthorisationError);
  this.expectError('Invalid method signature supplied');
});

ntest.it("emits error when receiving unexpected return data", function() {
  this.whenResponseIs(FakeData.SingleRecentTrack);
  this.expectError('Unexpected error');
});

ntest.it("emits authorised when successful", function() {
  this.whenResponseIs(FakeData.SuccessfulAuthorisation);
  assert.ok(this.authorisedSession);
  assert.ok(!this.error);
});

ntest.it("updates session key and user when successful", function() {
  this.whenResponseIs(FakeData.SuccessfulAuthorisation);
  assert.equal('username', this.session.user);
  assert.equal('sessionkey', this.session.key);
});

ntest.describe("an unauthorised session")
ntest.before(function() {
  setupLastFmSessionFixture(this);
});

ntest.it("emits error when attempting to make update calls", function() {
  this.session.update();
  assert.ok(this.error);
  assert.equal('Session is not authorised', this.error.message);
});

ntest.describe("an authorised session")
ntest.before(function() {
  setupLastFmSessionFixture(this);
  this.session.key = 'key';
});

ntest.it("allows update calls", function() {
  this.session.update();
  assert.ok(!this.error);
});

ntest.describe("update requests")
ntest.before(function() {
  var that = this;
  setupLastFmSessionFixture(this);
  this.session.key = 'key';
  this.whenResponseIs = function(returndata) {
    that.returndata = returndata;
    that.session.update('nowplaying', FakeTracks.RunToYourGrave);
  };
});

ntest.it("sends a signed request", function() {
  this.session.update('nowplaying', FakeTracks.RunToYourGrave);
  assert.ok(this.signed);
});

ntest.it("emits error when problem updating", function() {
  this.whenResponseIs(FakeData.UpdateError);
  this.expectError("Signature is invalid");
});

ntest.it("emits success when updated", function() {
  var that = this;
  this.track = null;
  var success = false;
  this.session.addListener('success', function(track) {
    that.track = track;
    success = true;
  });
  this.whenResponseIs(FakeData.UpdateSuccess);
  assert.ok(success);
  assert.equal('Run To Your Grave', this.track.name);
  assert.ok(!this.error);
});

ntest.describe("nowPlaying requests")
ntest.before(function() {
  var that = this;
  setupLastFmSessionFixture(this);
  this.session.key = 'key';
  this.whenResponseIs = function(returndata) {
    that.returndata = returndata;
    that.session.update('nowplaying', FakeTracks.RunToYourGrave);
  };
});

ntest.it("uses updateNowPlaying method", function() {
  this.session.update('nowplaying', FakeTracks.RunToYourGrave);
  assert.equal('user.updateNowPlaying', this.params.method);
});

ntest.it("sends required parameters", function() {
  this.session.update('nowplaying', FakeTracks.RunToYourGrave);
  assert.equal('The Mae Shi', this.params.artist);
  assert.equal('Run To Your Grave', this.params.track);
  assert.equal('key', this.params.sk);
});

ntest.describe("a scrobble request")
ntest.before(function() {
  var that = this;
  setupLastFmSessionFixture(this);
  this.session.key = 'key';
  this.whenResponseIs = function(returndata) {
    that.returndata = returndata;
    that.session.update('scrobble', FakeTracks.RunToYourGrave, { timestamp: 12345678 });
  };
});

ntest.it("emits error when no timestamp supplied", function() {
  this.session.update('scrobble', FakeTracks.RunToYourGrave);
  this.expectError("Timestamp is required for scrobbling");
});

ntest.it("uses scrobble method", function() {
  this.session.update('scrobble', FakeTracks.RunToYourGrave, { timestamp: 12345678 });
  assert.equal('track.scrobble', this.params.method);
});

ntest.it("sends required parameters", function() {
  this.session.update('scrobble', FakeTracks.RunToYourGrave, { timestamp: 12345678 });
  assert.equal('The Mae Shi', this.params.artist);
  assert.equal('Run To Your Grave', this.params.track);
  assert.equal('key', this.params.sk);
  assert.equal(12345678, this.params.timestamp);
});
