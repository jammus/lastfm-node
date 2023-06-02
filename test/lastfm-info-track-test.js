require("./common.js");

const assert = require("assert");

var LastFmInfo = require("../lib/lastfm/lastfm-info")
  , fakes = require("./fakes");

describe("a track info request", () => {
  var gently, lastfm;
  beforeEach(function() {
    gently = new Gently();
    lastfm = new LastFmNode();
  });

  it("calls method track.getInfo", function() {
    gently.expect(lastfm, "request", function(method, params) {
      assert.equal("track.getinfo", method);
      return new fakes.LastFmRequest();
    });
    new LastFmInfo(lastfm, "track", { mbid: "mbid" });
  });

  it("can accept artist, track name and mbid", function() {
    gently.expect(lastfm, "request", function(method, params) {
      assert.equal("The Mae Shi", params.artist);
      assert.equal("Run To Your Grave", params.track);
      assert.equal("1234567890", params.mbid);
      return new fakes.LastFmRequest();
    });
    new LastFmInfo(lastfm, "track", {
      artist: "The Mae Shi",
      track: "Run To Your Grave",
      mbid: "1234567890"
    });
  });
});
