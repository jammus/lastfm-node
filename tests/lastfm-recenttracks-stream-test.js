require("./common.js");

var RecentTracksParser = require("lastfm/recenttracks-parser").RecentTracksParser;
var RecentTracksStream = require("lastfm/recenttracks-stream").RecentTracksStream;

describe("a new stream instance");
  before(function() {
    this.gently = new Gently();
    this.lastfm = new LastFmNode();
    this.trackStream = new RecentTracksStream(this.lastfm, "username");
  });

  it("configures user", function() {
    assert.equal("username", this.trackStream.user);
  });

  it("checks every ten seconds", function() {
    assert.equal(10, this.trackStream.rate);
  });

  it("accepts listeners", function() {
    this.trackStream.addListener("event", function() {});
  });

  it("is not streaming", function() {
    var isStreaming = this.trackStream.isStreaming;
    assert.ok(!this.trackStream.isStreaming);
  });

  it("requests recent tracks", function() {
    assert.equal("user.getrecenttracks", this.trackStream.params.method);
  });

  it("only requests the most recent track", function() {
    assert.equal(1, this.trackStream.params.limit);
  });

  it("event handlers can be specified in options", function() {
    var handlers = {};
   
    this.gently.expect(handlers, "error");
    this.gently.expect(handlers, "lastPlayed");
    this.gently.expect(handlers, "nowPlaying");
    this.gently.expect(handlers, "stoppedPlaying");
    this.gently.expect(handlers, "scrobbled");

    var trackStream = new RecentTracksStream(this.lastfm, "username", {
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

describe("An active stream");
  before(function() { 
    this.parser = new RecentTracksParser();
    this.lastfm = new LastFmNode();
    this.trackStream = new RecentTracksStream(this.lastfm, "username", { parser: this.parser });
    this.gently = new Gently();
  });

  it("bubbles errors", function() {
    this.gently.expect(this.trackStream, "emit", function(event) {
      assert.equal("error", event);
    });
    this.parser.emit("error", new Error());
  });

  it("emits last played when track received", function() {
    this.gently.expect(this.trackStream, "emit", function(event, track) {
      assert.equal("lastPlayed", event);
      assert.equal("Lamb and the Lion", track.name);
    });
    this.parser.emit("track", FakeTracks.LambAndTheLion);
  });

  it("emits now playing if track flagged now playing", function() {
    this.gently.expect(this.trackStream, "emit", function(event, track) {
      assert.equal("nowPlaying", event);
      assert.equal("Run To Your Grave", track.name);
    });
    this.parser.emit("track", FakeTracks.RunToYourGrave_NP);
  });

  it("emits now playing and last played if both received", function() {
    this.gently.expect(this.trackStream, "emit", function(event, track) {
      assert.equal("nowPlaying", event);
      assert.equal("Theme Song", track.name);
    });
    this.gently.expect(this.trackStream, "emit", function(event, track) {
      assert.equal("lastPlayed", event);
      assert.equal("Over The Moon", track.name);
    });
    this.parser.emit("track", FakeTracks.NowPlayingAndScrobbled);
  });

  it("does not re-emit lastPlayed on receipt of same track", function() {
    this.gently.expect(this.trackStream, "emit", 1, function(event, track) {
      assert.equal("lastPlayed", event);
      assert.equal("Lamb and the Lion", track.name);
    });
    this.parser.emit("track", FakeTracks.LambAndTheLion);
    this.parser.emit("track", FakeTracks.LambAndTheLion);
  });

  it("does not re-emit nowPlaying on receipt of same track", function() {
    this.gently.expect(this.trackStream, "emit", 1, function(event, track) {
      assert.equal("nowPlaying", event);
      assert.equal("Run To Your Grave", track.name);
    });
    this.parser.emit("track", FakeTracks.RunToYourGrave_NP);
    this.parser.emit("track", FakeTracks.RunToYourGrave_NP);
  });

  it("emits stoppedPlaying track when now playing stops", function() {
    this.gently.expect(this.trackStream, "emit", function(event, track) {
      assert.equal("lastPlayed", event);
      assert.equal("Run To Your Grave", track.name);
    });
    this.gently.expect(this.trackStream, "emit", function(event, track) {
      assert.equal("nowPlaying", event);
      assert.equal("Run To Your Grave", track.name);
    });
    this.gently.expect(this.trackStream, "emit", function(event, track) {
      assert.equal("stoppedPlaying", event);
      assert.equal("Run To Your Grave", track.name);
    });
    this.parser.emit("track", FakeTracks.RunToYourGrave);
    this.parser.emit("track", FakeTracks.RunToYourGrave_NP);
    this.parser.emit("track", FakeTracks.RunToYourGrave);
  });

  it("emits scrobbled when last play changes", function() {
    this.gently.expect(this.trackStream, "emit", function(event, track) {
      assert.equal("lastPlayed", event);
      assert.equal("Lamb and the Lion", track.name);
    });
    this.gently.expect(this.trackStream, "emit", function(event, track) {
      assert.equal("nowPlaying", event);
      assert.equal("Run To Your Grave", track.name);
    });
    this.gently.expect(this.trackStream, "emit", function(event, track) {
      assert.equal("scrobbled", event);
      assert.equal("Run To Your Grave", track.name);
    });
    this.gently.expect(this.trackStream, "emit", function(event, track) {
      assert.equal("stoppedPlaying", event);
      assert.equal("Run To Your Grave", track.name);
    });
    this.parser.emit("track", FakeTracks.LambAndTheLion);
    this.parser.emit("track", FakeTracks.RunToYourGrave_NP);
    this.parser.emit("track", FakeTracks.RunToYourGrave);
  });
  
  it("emits nowPlaying when track same as lastPlayed", function() {
    this.gently.expect(this.trackStream, "emit", function(event, track) {
      assert.equal("lastPlayed", event);
      assert.equal("Run To Your Grave", track.name);
    });
    this.gently.expect(this.trackStream, "emit", function(event, track) {
      assert.equal("nowPlaying", event);
      assert.equal("Run To Your Grave", track.name);
    });
    this.parser.emit("track", FakeTracks.RunToYourGrave);
    this.parser.emit("track", FakeTracks.RunToYourGrave_NP);
  });

describe("Streaming")
  before(function() { 
    this.lastfm = new LastFmNode();
    this.gently = new Gently();
  });

  it("starts and stops streaming when requested", function() {
    this.gently.expect(this.lastfm, "read", 1, function(params, signed, callback) {
    });
    var trackStream = new RecentTracksStream(this.lastfm);
    trackStream.start();
    trackStream.stop();
    assert.ok(!trackStream.isStreaming);
  });

  it("starts automatically when autostart set to true", function() {
    this.gently.expect(this.lastfm, "read", function() {});
    var trackStream = new RecentTracksStream(this.lastfm, "username", { autostart: true} );
    assert.ok(trackStream.isStreaming);
    trackStream.stop();
  });
