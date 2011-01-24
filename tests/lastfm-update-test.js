require('./common.js');
var LastFmSession = require('lastfm/lastfm-session');
var LastFmUpdate = require('lastfm/lastfm-update');
var fakes = require("./fakes");

function setupFixture(context) {
  context.request = new fakes.LastFmRequest();
  context.returndata;
  context.options = {};
  context.session = null;
  context.method = "";
  context.gently = new Gently();
  context.lastfm = new LastFmNode();
  context.lastfmUpdate = null;
  context.authorisedSession = new LastFmSession(context.lastfm, "user", "key");
  context.requestError;

  context.whenWriteRequestReturns = function(data) {
    context.returndata = data;
    context.gently.expect(context.lastfm, "write", function(params, signed) {
      return context.request;
    });
  };

  context.whenWriteRequestThrowsError = function(errorMessage) {
    context.requestError = errorMessage;
    context.gently.expect(context.lastfm, "write", function(params, signed) {
      return context.request;
    });
  };

  context.andOptionsAre = function(setOptions) {
    context.options = setOptions;
  };

  context.andMethodIs = function(setMethod) {
    context.method = setMethod;
  };

  context.andSessionIs = function(setSession) {
    context.session = setSession;
  };

  context.expectSuccess = function(assertions) {
    context.options.success = function(track) {
      if (assertions) {
        assertions(track);
      }
    };
    context.lastfmUpdate = new LastFmUpdate(context.lastfm, context.method, context.session, context.options);
    context.request.emit("success", context.returndata);
  };

  context.expectError = function(expectedError) {
    context.options.error = context.gently.expect(function(error) {
      assert.equal(expectedError, error.message);
    });
    new LastFmUpdate(context.lastfm, context.method, context.session, context.options);
    if (context.requestError) {
      context.request.emit("error", new Error(context.requestError));
    }
    else {
      context.request.emit("success", context.returndata);
    }
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
    var that = this;
    this.gently.expect(this.lastfm, "write", function(params, signed) {
      assert.ok(signed);
      return that.request;
    });
    new LastFmUpdate(this.lastfm, "nowplaying", this.authorisedSession, { track: FakeTracks.RunToYourGrave });
});

  it("emits error when problem updating", function() {
    this.whenWriteRequestReturns(FakeData.UpdateError);
    this.andMethodIs("nowplaying");
    this.andSessionIs(this.authorisedSession);
    this.andOptionsAre({
        track: FakeTracks.RunToYourGrave
    });
    this.expectError("Invalid method signature supplied");
  });

describe("nowPlaying updates")
  before(function() {
    setupFixture(this);
  });

  it("uses updateNowPlaying method", function() {
    var that = this;
    this.gently.expect(this.lastfm, "write", function(params) {
      assert.equal("track.updateNowPlaying", params.method);
      return that.request;
    });
    new LastFmUpdate(this.lastfm, "nowplaying", this.authorisedSession, {
      track: FakeTracks.RunToYourGrave
    });
  });
  
  it("sends required parameters", function() {
    var that = this;
    this.gently.expect(this.lastfm, "write", function(params) {
      assert.equal("The Mae Shi", params.artist);
      assert.equal("Run To Your Grave", params.track);
      assert.equal("key", params.sk);
      return that.request;
    });
    new LastFmUpdate(this.lastfm, "nowplaying", this.authorisedSession, {
      track: FakeTracks.RunToYourGrave
    });
  });

  it("emits success when updated", function() {
    this.whenWriteRequestReturns(FakeData.UpdateNowPlayingSuccess);
    this.andMethodIs("nowplaying");
    this.andSessionIs(this.authorisedSession);
    this.andOptionsAre({
      track: FakeTracks.RunToYourGrave
    });
    this.expectSuccess(function(track) {
      assert.equal("Run To Your Grave", track.name);
    });
  });

  it("sends duration when supplied", function() {
    var that = this;
    this.gently.expect(this.lastfm, "write", function(params) {
      assert.equal(232000, params.duration);
      return that.request;
    });
    new LastFmUpdate(this.lastfm, "nowplaying", this.authorisedSession, {
      track: FakeTracks.RunToYourGrave,
      duration: 232000
    });
  });

  it("bubbles up errors", function() {
    var errorMessage = "Bubbled error";
    this.whenWriteRequestThrowsError(errorMessage);
    this.andMethodIs("nowplaying");
    this.andSessionIs(this.authorisedSession);
    this.andOptionsAre({
      track: FakeTracks.RunToYourGrave,
      timestamp: 12345678
    });
    this.expectError(errorMessage);
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
    var that = this;
    this.gently.expect(this.lastfm, "write", function(params) {
      assert.equal("track.scrobble", params.method);
      return that.request;
    });
    new LastFmUpdate(this.lastfm, "scrobble", this.authorisedSession, {
      track: FakeTracks.RunToYourGrave,
      timestamp: 12345678
    });
  });

  it("sends required parameters", function() {
    var that = this;
    this.gently.expect(this.lastfm, "write", function(params) {
      assert.equal("The Mae Shi", params.artist);
      assert.equal("Run To Your Grave", params.track);
      assert.equal("key", params.sk);
      assert.equal(12345678, params.timestamp);
      return that.request;
    });

    new LastFmUpdate(this.lastfm, "scrobble", this.authorisedSession, {
      track: FakeTracks.RunToYourGrave,
      timestamp: 12345678
    });
  });

  it("emits success when updated", function() {
    this.whenWriteRequestReturns(FakeData.ScrobbleSuccess);
    this.andMethodIs("scrobble");
    this.andSessionIs(this.authorisedSession);
    this.andOptionsAre({
      track: FakeTracks.RunToYourGrave,
      timestamp: 12345678
    });
    this.expectSuccess(function(track) {
      assert.equal("Run To Your Grave", track.name);
    });
  });

  it("bubbles up errors", function() {
    var errorMessage = "Bubbled error";
    this.whenWriteRequestThrowsError(errorMessage);
    this.andMethodIs("scrobble");
    this.andSessionIs(this.authorisedSession);
    this.andOptionsAre({
      track: FakeTracks.RunToYourGrave,
      timestamp: 12345678
    });
    this.expectError(errorMessage);
  });
