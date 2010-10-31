require('./common.js');
var LastFmSession = require('lastfm/lastfm-session').LastFmSession;

function setupFixture(context) {
  context.lastfm = new LastFmNode();
  context.session = new LastFmSession(context.lastfm);
  context.expectError = function(errorMessage) {
    context.gently.expect(context.session, "emit", function(event, error) {
      assert.equal("error", event);
      assert.equal(errorMessage, error.message);
    });
  };

  context.whenReadRequestReturns = function(returndata) {
    context.gently.expect(context.lastfm, "readRequest", function(params, signed, callback) {
      callback(returndata);
    });
  };

  context.whenWriteRequestReturns = function(returndata) {
    context.gently.expect(context.lastfm, "writeRequest", function(params, signed, callback) {
      callback(returndata);
    });
  };

  context.gently = new Gently();
};

describe("a new LastFmSession");
before(function() {
   this.session = new LastFmSession(new LastFmNode());
});

it("has no session key", function() {
  assert.ok(!this.session.key);
});

it("has no user", function() {
  assert.ok(!this.session.user);
});

it("can configure key and user", function() {
  var session = new LastFmSession(new LastFmNode(), "user", "sessionkey");
  assert.equal("user", session.user);
  assert.equal("sessionkey", session.key);
});

describe("a LastFmSession authorisation request")
before(function() {
   setupFixture(this);
});

it("emits error when no token supplied", function() {
  this.expectError("No token supplied");
  this.session.authorise(); 
});

it("contains supplied token", function() {
  this.gently.expect(this.lastfm, "readRequest", function(params) {
    assert.equal("token", params.token);
  });
  this.session.authorise("token");
});

it("uses getSession method", function() {
  this.gently.expect(this.lastfm, "readRequest", function(params) {
    assert.equal("auth.getsession", params.method);
  });
  this.session.authorise("token");
});

it("is signed", function() {
  this.gently.expect(this.lastfm, "readRequest", function(params, signed) {
    assert.ok(signed);
  });
  this.session.authorise("token");
});

describe("a completed LastFmSession authorisation request")
before(function() {
   setupFixture(this);
});

it("emits error when authorisation not successful", function() {
  this.whenReadRequestReturns(FakeData.AuthorisationError);
  this.expectError("Signature is invalid");
  this.session.authorise("token");
});

it("emits error when receiving unexpected return data", function() {
  this.whenReadRequestReturns(FakeData.SingleRecentTrack);
  this.expectError("Unexpected error");
  this.session.authorise("token");
});

it("emits authorised when successful", function() {
  this.whenReadRequestReturns(FakeData.SuccessfulAuthorisation);
  this.gently.expect(this.session, "emit", function(event) {
    assert.equal("authorised", event);
  });
  this.session.authorise("token");
});

it("updates session key and user when successful", function() {
  this.whenReadRequestReturns(FakeData.SuccessfulAuthorisation);
  this.gently.expect(this.session, "emit", function(event, session) {
    assert.equal("username", session.user);
    assert.equal("sessionkey", session.key);
  });
  this.session.authorise("token");
});

describe("an unauthorised session")
before(function() {
  setupFixture(this);
});

it("emits error when attempting to make update calls", function() {
  this.gently.expect(this.session, "emit", function(event, error) {
    assert.equal("error", event);
    assert.equal("Session is not authorised", error.message);
  });
  this.session.update();
});

describe("an authorised session")
before(function() {
  setupFixture(this);
  this.session.key = "key";
});

it("allows update calls", function() {
  this.session.update();
});

describe("update requests")
before(function() {
  setupFixture(this);
  this.session.key = "key";
});

it("sends a signed request", function() {
  this.gently.expect(this.lastfm, "writeRequest", function(params, signed) {
    assert.ok(signed);
  });
  this.session.update("nowplaying", FakeTracks.RunToYourGrave);
});

it("emits error when problem updating", function() {
  this.whenWriteRequestReturns(FakeData.UpdateError);
  this.expectError("Invalid method signature supplied");
  this.session.update("nowplaying", FakeTracks.RunToYourGrave);
});

describe("nowPlaying requests")
before(function() {
  setupFixture(this);
  this.session.key = "key";
});

it("uses updateNowPlaying method", function() {
  this.gently.expect(this.lastfm, "writeRequest", function(params) {
    assert.equal("track.updateNowPlaying", params.method);
  });
  this.session.update("nowplaying", FakeTracks.RunToYourGrave);
});

it("sends required parameters", function() {
  this.gently.expect(this.lastfm, "writeRequest", function(params) {
    assert.equal("The Mae Shi", params.artist);
    assert.equal("Run To Your Grave", params.track);
    assert.equal("key", params.sk);
  });
  this.session.update("nowplaying", FakeTracks.RunToYourGrave);
});

it("emits success when updated", function() {
  this.whenWriteRequestReturns(FakeData.UpdateNowPlayingSuccess);
  this.gently.expect(this.session, "emit", function(event, track) {
    assert.equal("success", event);
    assert.equal("Run To Your Grave", track.name);
  });
  this.session.update("nowplaying", FakeTracks.RunToYourGrave);
});

describe("a scrobble request")
before(function() {
  setupFixture(this);
  this.session.key = "key";
});

it("emits error when no timestamp supplied", function() {
  this.expectError("Timestamp is required for scrobbling");
  this.session.update("scrobble", FakeTracks.RunToYourGrave);
});

it("uses scrobble method", function() {
  this.gently.expect(this.lastfm, "writeRequest", function(params) {
    assert.equal("track.scrobble", params.method);
  });
  this.session.update("scrobble", FakeTracks.RunToYourGrave, { timestamp: 12345678 });
});

it("sends required parameters", function() {
  this.gently.expect(this.lastfm, "writeRequest", function(params) {
    assert.equal("The Mae Shi", params.artist);
    assert.equal("Run To Your Grave", params.track);
    assert.equal("key", params.sk);
    assert.equal(12345678, params.timestamp);
  });
  this.session.update("scrobble", FakeTracks.RunToYourGrave, { timestamp: 12345678 });
});

it("emits success when updated", function() {
  this.whenWriteRequestReturns(FakeData.ScrobbleSuccess);
  this.gently.expect(this.session, "emit", function(event, track) {
    assert.equal("success", event);
    assert.equal("Run To Your Grave", track.name);
  });
  this.session.update("scrobble", FakeTracks.RunToYourGrave, { timestamp: 12345678 });
});
