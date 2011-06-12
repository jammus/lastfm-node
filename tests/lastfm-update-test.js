require('./common.js');
var LastFmSession = require('lastfm/lastfm-session');
var LastFmUpdate = require('lastfm/lastfm-update');
var fakes = require("./fakes");

(function() {
  describe("new LastFmUpdate")
    it("can have success and error handlers specified at creation (deprecated)", function() {
      var gently = new Gently();
      var lastfm = new LastFmNode();
      var update = new LastFmUpdate(lastfm, "method", new LastFmSession(lastfm, "user", "key"), {
        error: gently.expect(function error() {}),
        success: gently.expect(function success() {})
      });
      update.emit("error");
      update.emit("success");
    });

    it("can have success and error handlers specified in option at creation", function() {
      var gently = new Gently();
      var lastfm = new LastFmNode();
      var update = new LastFmUpdate(lastfm, "method", new LastFmSession(lastfm, "user", "key"), { handlers: {
          error: gently.expect(function error() {}),
          success: gently.expect(function success() {})
      }});
      update.emit("error");
      update.emit("success");
    });
})();

(function() {
  var request, returndata, options, session, method, gently, lastfm, authorisedSession, requestError;

  function setupFixture() {
    request = new fakes.LastFmRequest();
    returndata;
    options = {};
    session = null;
    method = "";
    gently = new Gently();
    lastfm = new LastFmNode();
    authorisedSession = new LastFmSession(lastfm, "user", "key");
    requestError = null;
  }

  function whenWriteRequestReturns(data) {
    returndata = data;
    gently.expect(lastfm, "request", function(method, params) {
      return request;
    });
  }

  function whenWriteRequestThrowsError(errorMessage) {
    requestError = errorMessage;
    gently.expect(lastfm, "request", function(method, params) {
      return request;
    });
  }

  function andOptionsAre(setOptions) {
    options = setOptions;
  }

  function andMethodIs(setMethod) {
    method = setMethod;
  }

  function andSessionIs(setSession) {
    session = setSession;
  }

  function expectSuccess(assertions) {
    options.handlers = options.handlers || {};
    options.handlers.success = function(track) {
      if (assertions) {
        assertions(track);
      }
    };
    new LastFmUpdate(lastfm, method, session, options);
    request.emit("success", returndata);
  }

  function expectError(expectedError) {
    options.handlers = options.handlers || {};
    options.handlers.error = gently.expect(function(error) {
      assert.equal(expectedError, error.message);
    });
    new LastFmUpdate(lastfm, method, session, options);
    if (requestError) {
      request.emit("error", new Error(requestError));
    }
    else {
      request.emit("success", returndata);
    }
  }

  describe("update requests")
    before(function() {
      setupFixture();
    });
  
    it("fail when the session is not authorised", function() {
      var session = new LastFmSession();
      assert.throws(function() {
        new LastFmUpdate(lastfm, "method", session);
      });
    });
  
    it("emits error when problem updating", function() {
      whenWriteRequestReturns(FakeData.UpdateError);
      andMethodIs("nowplaying");
      andSessionIs(authorisedSession);
      andOptionsAre({
          track: FakeTracks.RunToYourGrave
      });
      expectError("Invalid method signature supplied");
    });
  
  describe("nowPlaying updates")
    before(function() {
      setupFixture();
    });
  
    it("uses updateNowPlaying method", function() {
      gently.expect(lastfm, "request", function(method, params) {
        assert.equal("track.updateNowPlaying", method);
        return request;
      });
      new LastFmUpdate(lastfm, "nowplaying", authorisedSession, {
        track: FakeTracks.RunToYourGrave
      });
    });
    
    it("sends required parameters", function() {
      gently.expect(lastfm, "request", function(method, params) {
        assert.equal("The Mae Shi", params.artist);
        assert.equal("Run To Your Grave", params.track);
        assert.equal("key", params.sk);
        return request;
      });
      new LastFmUpdate(lastfm, "nowplaying", authorisedSession, {
        track: FakeTracks.RunToYourGrave
      });
    });
  
    it("emits success when updated", function() {
      whenWriteRequestReturns(FakeData.UpdateNowPlayingSuccess);
      andMethodIs("nowplaying");
      andSessionIs(authorisedSession);
      andOptionsAre({
        track: FakeTracks.RunToYourGrave
      });
      expectSuccess(function(track) {
        assert.equal("Run To Your Grave", track.name);
      });
    });
  
    it("sends duration when supplied", function() {
      gently.expect(lastfm, "request", function(method, params) {
        assert.equal(232000, params.duration);
        return request;
      });
      new LastFmUpdate(lastfm, "nowplaying", authorisedSession, {
        track: FakeTracks.RunToYourGrave,
        duration: 232000
      });
    });

    it("can have artist and track string parameters supplied", function() {
      gently.expect(lastfm, "request", function(method, params) {
        assert.equal("The Mae Shi", params.artist);
        assert.equal("Run To Your Grave", params.track);
        assert.equal("key", params.sk);
        return request;
      });
      new LastFmUpdate(lastfm, "nowplaying", authorisedSession, {
        track: "Run To Your Grave",
        artist: "The Mae Shi"
      });
    });
  
    it("bubbles up errors", function() {
      var errorMessage = "Bubbled error";
      whenWriteRequestThrowsError(errorMessage);
      andMethodIs("nowplaying");
      andSessionIs(authorisedSession);
      andOptionsAre({
        track: FakeTracks.RunToYourGrave,
        timestamp: 12345678
      });
      expectError(errorMessage);
    });
  
  describe("a scrobble request")
    before(function() {
      setupFixture();
    });
  
    it("emits error when no timestamp supplied", function() {
      new LastFmUpdate(lastfm, "scrobble", authorisedSession, {
        track: FakeTracks.RunToYourGrave,
        handlers: {
          error: gently.expect(function error(error) {
            assert.equal("Timestamp is required for scrobbling", error.message);
          })
        }
      });
    });
    
    it("uses scrobble method", function() {
      gently.expect(lastfm, "request", function(method, params) {
        assert.equal("track.scrobble", method);
        return request;
      });
      new LastFmUpdate(lastfm, "scrobble", authorisedSession, {
        track: FakeTracks.RunToYourGrave,
        timestamp: 12345678
      });
    });
  
    it("sends required parameters", function() {
      gently.expect(lastfm, "request", function(method, params) {
        assert.equal("The Mae Shi", params.artist);
        assert.equal("Run To Your Grave", params.track);
        assert.equal("key", params.sk);
        assert.equal(12345678, params.timestamp);
        return request;
      });
  
      new LastFmUpdate(lastfm, "scrobble", authorisedSession, {
        track: FakeTracks.RunToYourGrave,
        timestamp: 12345678
      });
    });
  
    it("emits success when updated", function() {
      whenWriteRequestReturns(FakeData.ScrobbleSuccess);
      andMethodIs("scrobble");
      andSessionIs(authorisedSession);
      andOptionsAre({
        track: FakeTracks.RunToYourGrave,
        timestamp: 12345678
      });
      expectSuccess(function(track) {
        assert.equal("Run To Your Grave", track.name);
      });
    });
  
    it("bubbles up errors", function() {
      var errorMessage = "Bubbled error";
      whenWriteRequestThrowsError(errorMessage);
      andMethodIs("scrobble");
      andSessionIs(authorisedSession);
      andOptionsAre({
        track: FakeTracks.RunToYourGrave,
        timestamp: 12345678
      });
      expectError(errorMessage);
    });

    it("can have artist and track string parameters supplied", function() {
      gently.expect(lastfm, "request", function(method, params) {
        assert.equal("The Mae Shi", params.artist);
        assert.equal("Run To Your Grave", params.track);
        assert.equal("key", params.sk);
        return request;
      });
      new LastFmUpdate(lastfm, "scrobble", authorisedSession, {
        track: "Run To Your Grave",
        artist: "The Mae Shi",
        timestamp: 12345678
      });
    });

    it("can have arbitrary parameters supplied", function() {
      gently.expect(lastfm, "request", function(method, params) {
        assert.equal("somevalue", params.arbitrary);
        return request;
      });
      new LastFmUpdate(lastfm, "scrobble", authorisedSession, {
        track: "Run To Your Grave",
        artist: "The Mae Shi",
        timestamp: 12345678,
        arbitrary: "somevalue"
      });
    });

    it("does not include handler parameters", function() {
      gently.expect(lastfm, "request", function(method, params) {
        assert.equal(undefined, params.handlers);
        assert.equal(undefined, params.error);
        assert.equal(undefined, params.success);
        return request;
      });
      new LastFmUpdate(lastfm, "scrobble", authorisedSession, {
        track: "Run To Your Grave",
        artist: "The Mae Shi",
        timestamp: 12345678,
        handlers: { success: function() { } },
        success: function() { },
        error: function() { }
      });
    });
})();
