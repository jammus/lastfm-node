require("./common.js");
var LastFmInfo = require("lastfm/lastfm-info").LastFmInfo;

describe("a track info request")
  before(function() {
    this.gently = new Gently();
    this.lastfm = new LastFmNode();
  });

  it("calls method track.getInfo", function() {
    this.gently.expect(this.lastfm, "read", function(params, signed) {
      assert.equal("track.getinfo", params.method);
    });
    new LastFmInfo(this.lastfm, "track", { mbid: "mbid" });
  });

  it("can accept artist, track name and mbid", function() {
    this.gently.expect(this.lastfm, "read", function(params) {
      assert.equal("The Mae Shi", params.artist);
      assert.equal("Run To Your Grave", params.track);
      assert.equal("1234567890", params.mbid);
    });
    new LastFmInfo(this.lastfm, "track", {
      artist: "The Mae Shi",
      track: "Run To Your Grave",
      mbid: "1234567890"
    });
  });

  it("can accept basic track object", function() {
    this.gently.expect(this.lastfm, "read", function(params) {
      assert.equal("The Mae Shi", params.artist);
      assert.equal("Run To Your Grave", params.track);
      assert.equal("fakembid", params.mbid);
    });
    new LastFmInfo(this.lastfm, "track", { track: FakeTracks.RunToYourGrave });
  });
