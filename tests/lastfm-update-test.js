require('./common.js');
var LastFmSession = require('lastfm/lastfm-session').LastFmSession;
var LastFmUpdate = require('lastfm/lastfm-update').LastFmUpdate;

function setupFixture(context) {
  context.gently = new Gently();
  context.lastfm = new LastFmNode();
  context.authorisedSession = new LastFmSession(context.lastfm, "user", "key");
  context.whenWriteRequestReturns = function(returndata) {
    context.gently.expect(context.lastfm, "write", function(params, signed, callback) {
      callback(returndata);
    });
  };
};

describe("new LastFmUpdate")
  it("can have success and error handlers specified at creation", function() {
    var gently = new Gently();
    var lastfm = new LastFmNode();
    var update = new LastFmUpdate(lastfm, "method", new LastFmSession(lastfm, "user", "key"), {
        error: gently.expect(function error() {}),
        success: gently.expect(function success() {})
    });
    update.emit("error");
    update.emit("success");
  });

describe("update requests")
  before(function() {
    setupFixture(this);
  });

  it("fail when the session is not authorised", function() {
    var session = new LastFmSession();
    assert.throws(function() {
      new LastFmUpdate(this.lastfm, "method", session);
    });
  });

  it("sends a signed request", function() {
    this.gently.expect(this.lastfm, "write", function(params, signed) {
      assert.ok(signed);
    });
    new LastFmUpdate(this.lastfm, "nowplaying", this.authorisedSession, { track: FakeTracks.RunToYourGrave });
});

  it("emits error when problem updating", function() {
    this.whenWriteRequestReturns(FakeData.UpdateError);
    new LastFmUpdate(this.lastfm, "nowplaying", this.authorisedSession, {
        track: FakeTracks.RunToYourGrave,
        error: this.gently.expect(function error(error) {
          assert.equal("Invalid method signature supplied", error.message);
        })
    });
  });

describe("nowPlaying updates")
  before(function() {
    setupFixture(this);
  });

  it("uses updateNowPlaying method", function() {
    this.gently.expect(this.lastfm, "write", function(params) {
      assert.equal("track.updateNowPlaying", params.method);
    });
    new LastFmUpdate(this.lastfm, "nowplaying", this.authorisedSession, {
      track: FakeTracks.RunToYourGrave
    });
  });
  
  it("sends required parameters", function() {
    this.gently.expect(this.lastfm, "write", function(params) {
      assert.equal("The Mae Shi", params.artist);
      assert.equal("Run To Your Grave", params.track);
      assert.equal("key", params.sk);
    });
    new LastFmUpdate(this.lastfm, "nowplaying", this.authorisedSession, {
      track: FakeTracks.RunToYourGrave
    });
  });

  it("emits success when updated", function() {
    this.whenWriteRequestReturns(FakeData.UpdateNowPlayingSuccess);
    new LastFmUpdate(this.lastfm, "nowplaying", this.authorisedSession, {
      track: FakeTracks.RunToYourGrave,
      success: this.gently.expect(function success(track) {
        assert.equal("Run To Your Grave", track.name);
      })
    });
  });

  it("sends duration when supplied", function() {
    this.gently.expect(this.lastfm, "write", function(params) {
      assert.equal(232000, params.duration);
    });
    new LastFmUpdate(this.lastfm, "nowplaying", this.authorisedSession, {
      track: FakeTracks.RunToYourGrave,
      duration: 232000
    });
  });

describe("a scrobble request")
  before(function() {
    setupFixture(this);
  });

  it("emits error when no timestamp supplied", function() {
    new LastFmUpdate(this.lastfm, "scrobble", this.authorisedSession, {
      track: FakeTracks.RunToYourGrave,
      error: this.gently.expect(function error(error) {
        assert.equal("Timestamp is required for scrobbling", error.message);
      })
    });
  });
  
  it("uses scrobble method", function() {
    this.gently.expect(this.lastfm, "write", function(params) {
      assert.equal("track.scrobble", params.method);
    });
    new LastFmUpdate(this.lastfm, "scrobble", this.authorisedSession, {
      track: FakeTracks.RunToYourGrave,
      timestamp: 12345678
    });
  });

  it("sends required parameters", function() {
    this.gently.expect(this.lastfm, "write", function(params) {
      assert.equal("The Mae Shi", params.artist);
      assert.equal("Run To Your Grave", params.track);
      assert.equal("key", params.sk);
      assert.equal(12345678, params.timestamp);
    });
    new LastFmUpdate(this.lastfm, "scrobble", this.authorisedSession, {
      track: FakeTracks.RunToYourGrave,
      timestamp: 12345678
    });
  });

  it("emits success when updated", function() {
    this.whenWriteRequestReturns(FakeData.ScrobbleSuccess);
    new LastFmUpdate(this.lastfm, "scrobble", this.authorisedSession, {
      track: FakeTracks.RunToYourGrave,
      timestamp: 12345678,
      success: this.gently.expect(function success(track) {
        assert.equal("Run To Your Grave", track.name);
      })
    });
  });
