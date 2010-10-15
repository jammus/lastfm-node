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

ntest.it("emits error when attempting to update nowPlaying", function() {
  this.session.updateNowPlaying(FakeTracks.RunToYourGrave);
  assert.ok(this.error);
  assert.equal('Session is not authorised', this.error.message);
});

ntest.it("emits error when attempting to scrobble", function() {
  this.session.scrobble(FakeTracks.RunToYourGrave);
  assert.ok(this.error);
  assert.equal('Session is not authorised', this.error.message);
});

ntest.describe("an authorised session")
ntest.before(function() {
  setupLastFmSessionFixture(this);
});

ntest.it("allows updating of nowPlaying", function() {
  this.session.key = 'key';
  this.session.updateNowPlaying(FakeTracks.RunToYourGrave);
  assert.ok(!this.error);
});

ntest.it("allows scrobbling", function() {
  this.session.key = 'key';
  this.session.scrobble(FakeTracks.RunToYourGrave, 12345678);
  assert.ok(!this.error);
});

ntest.describe("nowPlaying requests")
ntest.before(function() {
  var that = this;
  setupLastFmSessionFixture(this);
  this.session.key = 'key';
  this.whenResponseIs = function(returndata) {
    that.returndata = returndata;
    that.session.updateNowPlaying(FakeTracks.RunToYourGrave);
  };
});

ntest.it("sends a signed request", function() {
  this.session.updateNowPlaying(FakeTracks.RunToYourGrave);
  assert.ok(this.signed);
});

ntest.it("uses updateNowPlaying method", function() {
  this.session.updateNowPlaying(FakeTracks.RunToYourGrave);
  assert.equal('user.updateNowPlaying', this.params.method);
});

ntest.it("sends required parameters", function() {
  this.session.updateNowPlaying(FakeTracks.RunToYourGrave);
  assert.equal('The Mae Shi', this.params.artist);
  assert.equal('Run To Your Grave', this.params.track);
  assert.equal('key', this.params.sk);
});

ntest.it("emits error when problem updating", function() {
  this.whenResponseIs(FakeData.UpdateNowPlayingError);
  this.expectError("Signature is invalid");
});

ntest.it("emits success when updated", function() {
  var that = this;
  var success = false;
  this.session.addListener('success', function() {
    success = true;
  });
  this.whenResponseIs(FakeData.UpdateNowPlayingSuccess);
  assert.ok(success);
  assert.ok(!this.error);
});

ntest.describe("a scrobble request")
ntest.before(function() {
  var that = this;
  setupLastFmSessionFixture(this);
  this.session.key = 'key';
  this.whenResponseIs = function(returndata) {
    that.returndata = returndata;
    that.session.scrobble(FakeTracks.RunToYourGrave, 12345678);
  };
});

ntest.it("emits error when no timestamp supplied", function() {
  this.session.scrobble(FakeTracks.RunToYourGrave);
  this.expectError("Timestamp is required for scrobbling");
});

ntest.it("sends a signed request", function() {
  this.session.scrobble(FakeTracks.RunToYourGrave, 12345678);
  assert.ok(this.signed);
});

ntest.it("uses scrobble method", function() {
  this.session.scrobble(FakeTracks.RunToYourGrave, 12345678);
  assert.equal('track.scrobble', this.params.method);
});

ntest.it("sends required parameters", function() {
  this.session.scrobble(FakeTracks.RunToYourGrave, 12345678);
  assert.equal('The Mae Shi', this.params.artist);
  assert.equal('Run To Your Grave', this.params.track);
  assert.equal('key', this.params.sk);
  assert.equal(12345678, this.params.timestamp);
});

ntest.it("emits error when problem updating", function() {
  this.whenResponseIs(FakeData.UpdateNowPlayingError);
  this.expectError("Signature is invalid");
});

ntest.it("emits success when updated", function() {
  var that = this;
  var success = false;
  this.session.addListener('success', function() {
    success = true;
  });
  this.whenResponseIs(FakeData.UpdateNowPlayingSuccess);
  assert.ok(success);
  assert.ok(!this.error);
});
