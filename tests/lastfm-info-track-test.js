require("./common.js");

var LastFmInfo = require("../lib/lastfm/lastfm-info")
  , fakes = require("./fakes");

(function() {
  describe("a track info request");

  before(function() {
    this.gently = new Gently();
    this.lastfm = new LastFmNode();
  });

  it("calls method track.getInfo", function() {
    this.gently.expect(this.lastfm, "request", function(method, params) {
      assert.equal("track.getinfo", method);
      return new fakes.LastFmRequest();
    });
    new LastFmInfo(this.lastfm, "track", { mbid: "mbid" });
  });

  it("can accept artist, track name and mbid", function() {
    this.gently.expect(this.lastfm, "request", function(method, params) {
      assert.equal("The Mae Shi", params.artist);
      assert.equal("Run To Your Grave", params.track);
      assert.equal("1234567890", params.mbid);
      return new fakes.LastFmRequest();
    });
    new LastFmInfo(this.lastfm, "track", {
      artist: "The Mae Shi",
      track: "Run To Your Grave",
      mbid: "1234567890"
    });
  });
})();
