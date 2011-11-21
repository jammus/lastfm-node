require("./common.js");

var _ = require("underscore")
  , RecentTracksStream = require("../lib/lastfm/recenttracks-stream")
  , LastFmRequest = require("../lib/lastfm/lastfm-request")
  , fakes = require("./fakes");

(function() {
  var gently, lastfm, trackStream;

  describe("a new stream instance");

  before(function() {
    gently = new Gently();
    lastfm = new LastFmNode();
    trackStream = new RecentTracksStream(lastfm, "username");
  });

  it("accepts listeners", function() {
    trackStream.addListener("event", function() {});
  });

  it("is not streaming", function() {
    assert.ok(!trackStream.isStreaming());
  });

  it("event handlers can be specified in options", function() {
    var handlers = {};
   
    gently.expect(handlers, "error");
    gently.expect(handlers, "lastPlayed");
    gently.expect(handlers, "nowPlaying");
    gently.expect(handlers, "stoppedPlaying");
    gently.expect(handlers, "scrobbled");

    var trackStream = new RecentTracksStream(lastfm, "username", {
      handlers: {
        error: handlers.error,
        lastPlayed: handlers.lastPlayed,
        nowPlaying: handlers.nowPlaying,
        stoppedPlaying: handlers.stoppedPlaying,
        scrobbled: handlers.scrobbled
      }
    });

    trackStream.emit("error");
    trackStream.emit("lastPlayed");
    trackStream.emit("nowPlaying");
    trackStream.emit("stoppedPlaying");
    trackStream.emit("scrobbled");
  });
})();

(function() {
  var requestEmits = [],
      previousEmits = [];

  function ifRequestHasPreviouslyEmit(emits) {
    previousEmits = emits;
  }

  function whenRequestEmits(count, event, object) {
    if (typeof count !== "number") {
      object = event;
      event = count;
      count = 1;
    }
    if (typeof event !== "string") {
      object = event;
      event = "success";
    }
    requestEmits = [event, object, count];
  }

  function expectStreamToEmit(count, expectation) {
    if (typeof count === "function") {
      expectation = count;
      count = 1;
    }
    var lastfm = new LastFmNode(),
        connection = new fakes.Client(80, lastfm.host),
        request = new fakes.LastFmRequest(),
        gently = new Gently();

    gently.expect(lastfm, "request", function() {
      return request;
    });

    var trackStream = new RecentTracksStream(lastfm, "username");
    trackStream.start();
    trackStream.stop();
    for(var index = 0; index < previousEmits.length; index++) {
      request.emit("success", previousEmits[index]);
    }
    gently.expect(trackStream, "emit", count, expectation);
    for(var times = 0; times < requestEmits[2]; times++) {
      request.emit(requestEmits[0], requestEmits[1]);
    }
  }

  describe("An active stream");

  before(function() {
    previousEmits = [];
    requestEmits = [];
  });

  it("bubbles errors", function() {
    whenRequestEmits("error", { error: 1, message: "An error" });
    expectStreamToEmit(function(event, error) {
      assert.equal("error", event);
      assert.equal("An error", error.message);
    });
  });

  it("emits last played when track received", function() {
    whenRequestEmits({ recenttracks: { track:
      FakeTracks.LambAndTheLion
    } });
    expectStreamToEmit(function(event, track) {
      assert.equal("lastPlayed", event);
      assert.equal("Lamb and the Lion", track.name);
    });
  });

  it("emits now playing if track flagged now playing", function() {
    whenRequestEmits({
      recenttracks: { track: FakeTracks.RunToYourGrave_NP }
    });
    expectStreamToEmit(function(event, track) {
      assert.equal("nowPlaying", event);
      assert.equal("Run To Your Grave", track.name);
    });
  });

  it("emits now playing and last played if both received", function() {
    var count = 0;
    whenRequestEmits({
      recenttracks: { track: FakeTracks.NowPlayingAndScrobbled }
    });
    expectStreamToEmit(2, function(event, track) {
      if (count == 0) {
          assert.equal("nowPlaying", event);
          assert.equal("Theme Song", track.name);
      }
      else {
          assert.equal("lastPlayed", event);
          assert.equal("Over The Moon", track.name);
      }
      count++;
    });
  });

  it("does not re-emit lastPlayed on receipt of same track", function() {
    whenRequestEmits(2, {
      recenttracks: { track: FakeTracks.LambAndTheLion }
    });
    expectStreamToEmit(1, function(event, track) {
      assert.equal("lastPlayed", event);
      assert.equal("Lamb and the Lion", track.name);
    });
  });

  it("does not re-emit nowPlaying on receipt of same track", function() {
    whenRequestEmits(2, {
      recenttracks: { track: FakeTracks.RunToYourGrave_NP }
    });
    expectStreamToEmit(1, function(event, track) {
      assert.equal("nowPlaying", event);
      assert.equal("Run To Your Grave", track.name);
    });
  });

  it("emits stoppedPlaying track when now playing stops", function() {
    ifRequestHasPreviouslyEmit([
      { recenttracks: { track: FakeTracks.RunToYourGrave } },
      { recenttracks: { track: FakeTracks.RunToYourGrave_NP } }
    ]);
    whenRequestEmits({
      recenttracks: { track: FakeTracks.RunToYourGrave }
    });
    expectStreamToEmit(function(event, track) {
      assert.equal("stoppedPlaying", event);
      assert.equal("Run To Your Grave", track.name);
    });
  });

  it("emits scrobbled when last play changes", function() {
    ifRequestHasPreviouslyEmit([
      { recenttracks: { track: FakeTracks.LambAndTheLion } },
      { recenttracks: { track: FakeTracks.RunToYourGrave_NP } }
    ]);
    whenRequestEmits({
      recenttracks: { track: FakeTracks.RunToYourGrave }
    });
    expectStreamToEmit(function(event, track) {
      assert.equal("scrobbled", event);
      assert.equal("Run To Your Grave", track.name);
    });
  });
  
  it("emits nowPlaying when track same as lastPlayed", function() {
    ifRequestHasPreviouslyEmit([
      { recenttracks: { track: FakeTracks.RunToYourGrave } }
    ]);
    whenRequestEmits({
      recenttracks: { track: FakeTracks.RunToYourGrave_NP }
    });
    expectStreamToEmit(function(event, track) {
      assert.equal("nowPlaying", event);
      assert.equal("Run To Your Grave", track.name);
    });
  });

  it("emits error when unexpected item is received", function() {
    whenRequestEmits({
      something: "we've never seen before"
    });
    expectStreamToEmit(function(event, error) {
      assert.equal("error", event);
      assert.equal("Unexpected response", error.message);
    });
  });
})();

(function() {
  var lastfm, gently, request;

  describe("Streaming")

  before(function() { 
    lastfm = new LastFmNode();
    gently = new Gently();
    request = new fakes.LastFmRequest();
  });

  it("starts and stops streaming when requested", function() {
    gently.expect(lastfm, "request", 1, function(method, params) {
      return request;
    });
    var trackStream = new RecentTracksStream(lastfm);
    trackStream.start();
    trackStream.stop();
    assert.ok(!trackStream.isStreaming());
  });

  it("starts automatically when autostart set to true", function() {
    gently.expect(lastfm, "request", function() {
      return request;
    });
    var trackStream = new RecentTracksStream(lastfm, "username", { autostart: true} );
    assert.ok(trackStream.isStreaming());
    trackStream.stop();
  });

  it("calls user.getrecenttracks method for user", function() {
    gently.expect(lastfm, "request", function(method, params) {
      assert.equal("user.getrecenttracks", method);
      assert.equal("username", params.user);
      return request;
    });
    var trackStream = new RecentTracksStream(lastfm, "username", { autostart: true} );
    trackStream.stop();
  });

  it("only fetches most recent track", function() {
    gently.expect(lastfm, "request", function(method, params) {
      assert.equal(1, params.limit);
      return request;
    });
    var trackStream = new RecentTracksStream(lastfm, "username", { autostart: true} );
    trackStream.stop();
  });

  it("bubbles up errors", function() {
    var errorMessage = "Bubbled error";
    gently.expect(lastfm, "request", function() {
      return request;
    });
    var trackStream = new RecentTracksStream(lastfm, "username", { autostart:true });
    gently.expect(trackStream, "emit", function(event, error) {
      assert.equal(errorMessage, error.message);
    });
    request.emit("error", new Error(errorMessage));
    trackStream.stop();
  });
})();

(function() {
  var lastfm, gently;

  describe("Streaming")

  var tmpScheduleFn;
  before(function() { 
    tmpScheduleFn = RecentTracksStream.prototype.scheduleCallback;
    lastfm = new LastFmNode();
    gently = new Gently();
  });

  after(function() {
    RecentTracksStream.prototype.scheduleCallback = tmpScheduleFn;
  });

  it("queries API every 10 seconds", function() {
    var trackStream = new RecentTracksStream(lastfm, "username");
    var count = 0;
    RecentTracksStream.prototype.scheduleCallback = function(callback, delay) {
      count++;
      if (count === 10) {
        trackStream.stop();
      }
      assert.ok(delay, 10000);
      gently.expect(lastfm, "request", function(method, params) {
        return new fakes.LastFmRequest();
      });
      callback();
    };
    gently.expect(lastfm, "request", function(method, params) {
      return new fakes.LastFmRequest();
    });
    trackStream.start();
  });
})();
