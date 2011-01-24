require("./common.js");

var RecentTracksParser = require("lastfm/recenttracks-parser");
var RecentTracksStream = require("lastfm/recenttracks-stream");

(function() {
  var gently, lastfm, trackStream;

  describe("a new stream instance");

  before(function() {
    gently = new Gently();
    lastfm = new LastFmNode();
    trackStream = new RecentTracksStream(lastfm, "username");
  });

  it("configures user", function() {
    assert.equal("username", trackStream.user);
  });

  it("checks every ten seconds", function() {
    assert.equal(10, trackStream.rate);
  });

  it("accepts listeners", function() {
    trackStream.addListener("event", function() {});
  });

  it("is not streaming", function() {
    var isStreaming = trackStream.isStreaming;
    assert.ok(!trackStream.isStreaming);
  });

  it("requests recent tracks", function() {
    assert.equal("user.getrecenttracks", trackStream.params.method);
  });

  it("only requests the most recent track", function() {
    assert.equal(1, trackStream.params.limit);
  });

  it("event handlers can be specified in options", function() {
    var handlers = {};
   
    gently.expect(handlers, "error");
    gently.expect(handlers, "lastPlayed");
    gently.expect(handlers, "nowPlaying");
    gently.expect(handlers, "stoppedPlaying");
    gently.expect(handlers, "scrobbled");

    var trackStream = new RecentTracksStream(lastfm, "username", {
      error: handlers.error,
      lastPlayed: handlers.lastPlayed,
      nowPlaying: handlers.nowPlaying,
      stoppedPlaying: handlers.stoppedPlaying,
      scrobbled: handlers.scrobbled
    });

    trackStream.emit("error");
    trackStream.emit("lastPlayed");
    trackStream.emit("nowPlaying");
    trackStream.emit("stoppedPlaying");
    trackStream.emit("scrobbled");
  });
})();

(function() {
  var parser, lastfm, trackStream, gently;

  describe("An active stream");

  before(function() { 
    parser = new RecentTracksParser();
    lastfm = new LastFmNode();
    trackStream = new RecentTracksStream(lastfm, "username", { parser: parser });
    gently = new Gently();
  });

  it("bubbles errors", function() {
    gently.expect(trackStream, "emit", function(event) {
      assert.equal("error", event);
    });
    parser.emit("error", new Error());
  });

  it("emits last played when track received", function() {
    gently.expect(trackStream, "emit", function(event, track) {
      assert.equal("lastPlayed", event);
      assert.equal("Lamb and the Lion", track.name);
    });
    parser.emit("track", FakeTracks.LambAndTheLion);
  });

  it("emits now playing if track flagged now playing", function() {
    gently.expect(trackStream, "emit", function(event, track) {
      assert.equal("nowPlaying", event);
      assert.equal("Run To Your Grave", track.name);
    });
    parser.emit("track", FakeTracks.RunToYourGrave_NP);
  });

  it("emits now playing and last played if both received", function() {
    gently.expect(trackStream, "emit", function(event, track) {
      assert.equal("nowPlaying", event);
      assert.equal("Theme Song", track.name);
    });
    gently.expect(trackStream, "emit", function(event, track) {
      assert.equal("lastPlayed", event);
      assert.equal("Over The Moon", track.name);
    });
    parser.emit("track", FakeTracks.NowPlayingAndScrobbled);
  });

  it("does not re-emit lastPlayed on receipt of same track", function() {
    gently.expect(trackStream, "emit", 1, function(event, track) {
      assert.equal("lastPlayed", event);
      assert.equal("Lamb and the Lion", track.name);
    });
    parser.emit("track", FakeTracks.LambAndTheLion);
    parser.emit("track", FakeTracks.LambAndTheLion);
  });

  it("does not re-emit nowPlaying on receipt of same track", function() {
    gently.expect(trackStream, "emit", 1, function(event, track) {
      assert.equal("nowPlaying", event);
      assert.equal("Run To Your Grave", track.name);
    });
    parser.emit("track", FakeTracks.RunToYourGrave_NP);
    parser.emit("track", FakeTracks.RunToYourGrave_NP);
  });

  it("emits stoppedPlaying track when now playing stops", function() {
    gently.expect(trackStream, "emit", function(event, track) {
      assert.equal("lastPlayed", event);
      assert.equal("Run To Your Grave", track.name);
    });
    gently.expect(trackStream, "emit", function(event, track) {
      assert.equal("nowPlaying", event);
      assert.equal("Run To Your Grave", track.name);
    });
    gently.expect(trackStream, "emit", function(event, track) {
      assert.equal("stoppedPlaying", event);
      assert.equal("Run To Your Grave", track.name);
    });
    parser.emit("track", FakeTracks.RunToYourGrave);
    parser.emit("track", FakeTracks.RunToYourGrave_NP);
    parser.emit("track", FakeTracks.RunToYourGrave);
  });

  it("emits scrobbled when last play changes", function() {
    gently.expect(trackStream, "emit", function(event, track) {
      assert.equal("lastPlayed", event);
      assert.equal("Lamb and the Lion", track.name);
    });
    gently.expect(trackStream, "emit", function(event, track) {
      assert.equal("nowPlaying", event);
      assert.equal("Run To Your Grave", track.name);
    });
    gently.expect(trackStream, "emit", function(event, track) {
      assert.equal("scrobbled", event);
      assert.equal("Run To Your Grave", track.name);
    });
    gently.expect(trackStream, "emit", function(event, track) {
      assert.equal("stoppedPlaying", event);
      assert.equal("Run To Your Grave", track.name);
    });
    parser.emit("track", FakeTracks.LambAndTheLion);
    parser.emit("track", FakeTracks.RunToYourGrave_NP);
    parser.emit("track", FakeTracks.RunToYourGrave);
  });
  
  it("emits nowPlaying when track same as lastPlayed", function() {
    gently.expect(trackStream, "emit", function(event, track) {
      assert.equal("lastPlayed", event);
      assert.equal("Run To Your Grave", track.name);
    });
    gently.expect(trackStream, "emit", function(event, track) {
      assert.equal("nowPlaying", event);
      assert.equal("Run To Your Grave", track.name);
    });
    parser.emit("track", FakeTracks.RunToYourGrave);
    parser.emit("track", FakeTracks.RunToYourGrave_NP);
  });
})();

(function() {
  var lastfm, gently;

  describe("Streaming")

  before(function() { 
    lastfm = new LastFmNode();
    gently = new Gently();
  });

  it("starts and stops streaming when requested", function() {
    gently.expect(lastfm, "read", 1, function(params, signed, callback) {
    });
    var trackStream = new RecentTracksStream(lastfm);
    trackStream.start();
    trackStream.stop();
    assert.ok(!trackStream.isStreaming);
  });

  it("starts automatically when autostart set to true", function() {
    gently.expect(lastfm, "read", function() {});
    var trackStream = new RecentTracksStream(lastfm, "username", { autostart: true} );
    assert.ok(trackStream.isStreaming);
    trackStream.stop();
  });
})();
