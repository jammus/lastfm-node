require("./common.js");
var LastFmInfo = require("lastfm/lastfm-info").LastFmInfo;

describe("a track info request")
  before(function() {
    this.gently = new Gently();
    this.lastfm = new LastFmNode();
  });

  it("calls unsigned method track.getInfo", function() {
    this.gently.expect(this.lastfm, "readRequest", function(params, signed) {
      assert.equal("track.getinfo", params.method);
      assert.equal(false, signed);
    });
    new LastFmInfo(this.lastfm, "track", { mbid: "mbid" });
  });

  it("passes track name and artist (when specified) to readRequest", function() {
    this.gently.expect(this.lastfm, "readRequest", function(params) {
      assert.equal("The Mae Shi", params.artist);
      assert.equal("The Lamb and the Lion", params.track);
    });
    new LastFmInfo(this.lastfm, "track", { artist: "The Mae Shi", track: "The Lamb and the Lion" });
  });

  it("passes mbid (when specified) to readRequest", function() {
    this.gently.expect(this.lastfm, "readRequest", function(params) {
      assert.equal("1234567890", params.mbid);
    });
    new LastFmInfo(this.lastfm, "track", { mbid: "1234567890" });
  });

  it("can accept basic track object", function() {
    this.gently.expect(this.lastfm, "readRequest", function(params) {
      assert.equal("The Mae Shi", params.artist);
      assert.equal("Run To Your Grave", params.track);
      assert.equal("fakembid", params.mbid);
    });
    new LastFmInfo(this.lastfm, "track", { track: FakeTracks.RunToYourGrave });
  });

  it("passes through additional parameters", function() {
    this.gently.expect(this.lastfm, "readRequest", function(params) {
      assert.equal("username", params.username);
      assert.equal("anything", params.arbitrary);
    });
    new LastFmInfo(this.lastfm, "track", { track: FakeTracks.RunToYourGrave, username: "username", arbitrary: "anything" });
  });

  it("doesnt pass through callback parameters", function() {
    this.gently.expect(this.lastfm, "readRequest", function(params) {
      assert.ok(!params.error);
      assert.ok(!params.success);
    });
    new LastFmInfo(this.lastfm, "track", { track: FakeTracks.RunToYourGrave, error: function() {}, success: function() {} });
  });

describe("when receiving data")
  before(function() {
    this.gently = new Gently();
    this.lastfm = new LastFmNode();
  });

  it("emits error if response contains error", function() {
    this.gently.expect(this.lastfm, "readRequest", function(params, signed, callback) {
      callback(FakeData.NotEnoughTrackInfo);
    });
    new LastFmInfo(this.lastfm, "track", {
      error: this.gently.expect(function errorHandler(error) {
        assert.equal("You must supply either a track & artist name or a track mbid.", error.message);
      })
    });
  });

  it("emits error when receiving unexpected data", function() {
    this.gently.expect(this.lastfm, "readRequest", function(params, signed, callback) {
      callback(FakeData.SuccessfulAuthorisation);
    });
    new LastFmInfo(this.lastfm, "track", {
      error: this.gently.expect(function errorHandler(error) {
        assert.equal("Unexpected error", error.message);
      })
    });
  });

  it("emits success when track info received", function() {
    this.gently.expect(this.lastfm, "readRequest", function(params, signed, callback) {
      callback(FakeData.RunToYourGraveTrackInfo);
    });
    new LastFmInfo(this.lastfm, "track", {
      success: this.gently.expect(function success(track) {
        assert.equal("Run To Your Grave", track.name);
        assert.equal("232000", track.duration);
      })
    });
  });
