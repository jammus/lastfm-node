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
    parser.parse('');
  })

  it("emits error when no recenttracks object", function() {
    gently.expect(parser, "emit", function(event, error) {
      assert.equal("error", event);
      assert.ok(error.message.indexOf(FakeData.UnknownObject) > -1);
    });
    parser.parse(FakeData.UnknownObject);
  })

  it("emits error when no recenttracks.track object", function() {
    gently.expect(parser, "emit", function(event, error) {
      assert.equal("error", event);
      assert.ok(error.message.indexOf(FakeData.UnexpectedRecentTracks) > -1);
    });
    parser.parse(FakeData.UnexpectedRecentTracks);
  });

  it("emits track for value of recenttracks.track", function() {
    gently.expect(parser, "emit", function(event, track) {
      assert.equal("track", event);
      assert.equal(42, track);
    });
    parser.parse(FakeData.SingleRecentTrack);
  })

  it("returns multiple track when array", function() {
    gently.expect(parser, "emit", function(event, tracks) {
      assert.equal("first", tracks[0]);
      assert.equal("second", tracks[1]);
    });
    parser.parse(FakeData.MultipleRecentsTracks);
  })

  it("emits error when response contains error", function() {
    gently.expect(parser, "emit", function(event, error) {
      assert.equal("error", event);
      assert.equal(FakeData.Error.message, error.message);
    });
    parser.parse(FakeData.Error);
  });

  it("emits error containing received data when garbage", function() {
    gently.expect(parser, "emit", function(event, error) {
      assert.equal("error", event);
      assert.ok(error.message.indexOf(FakeData.Garbage) > -1);
    });
    parser.parse(FakeData.Garbage);
  });
})();
