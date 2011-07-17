require("./common.js");

var RecentTracksParser = require("lastfm/recenttracks-parser");

(function() {
  var parser, gently;

  describe("parser")

  before(function() { 
    parser = new RecentTracksParser();
    gently = new Gently();
  })

  it("emits error when empty", function() {
    gently.expect(parser, "emit", function(event, error) {
      assert.equal("error", event);
    });
    parser.parse(null);
  })

  it("emits error when no recenttracks object", function() {
    gently.expect(parser, "emit", function(event, error) {
      assert.equal("error", event);
    });
    parser.parse(JSON.parse(FakeData.UnknownObject));
  })

  it("emits error when no recenttracks.track object", function() {
    gently.expect(parser, "emit", function(event, error) {
      assert.equal("error", event);
    });
    parser.parse(JSON.parse(FakeData.UnexpectedRecentTracks));
  });

  it("emits track for value of recenttracks.track", function() {
    gently.expect(parser, "emit", function(event, track) {
      assert.equal("track", event);
      assert.equal(42, track);
    });
    parser.parse(JSON.parse(FakeData.SingleRecentTrack));
  })

  it("returns multiple track when array", function() {
    gently.expect(parser, "emit", function(event, tracks) {
      assert.equal("first", tracks[0]);
      assert.equal("second", tracks[1]);
    });
    parser.parse(JSON.parse(FakeData.MultipleRecentsTracks));
  })
})();
