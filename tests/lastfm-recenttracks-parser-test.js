require("./common.js");

var RecentTracksParser = require("lastfm/recenttracks-parser").RecentTracksParser;

describe("parser")
  before(function() { 
    this.parser = new RecentTracksParser();
    this.gently = new Gently();
  })

  it("emits error when empty", function() {
    this.gently.expect(this.parser, "emit", function(event, error) {
      assert.equal("error", event);
    });
    this.parser.parse('');
  })

  it("emits error when no recenttracks object", function() {
    this.gently.expect(this.parser, "emit", function(event, error) {
      assert.equal("error", event);
      assert.ok(error.message.indexOf(FakeData.UnknownObject) > -1);
    });
    this.parser.parse(FakeData.UnknownObject);
  })

  it("emits track for value of recenttracks.track", function() {
    this.gently.expect(this.parser, "emit", function(event, track) {
      assert.equal("track", event);
      assert.equal(42, track);
    });
    this.parser.parse(FakeData.SingleRecentTrack);
  })

  it("returns multiple track when array", function() {
    this.gently.expect(this.parser, "emit", function(event, tracks) {
      assert.equal("first", tracks[0]);
      assert.equal("second", tracks[1]);
    });
    this.parser.parse(FakeData.MultipleRecentsTracks);
  })

  it("emits error containing received data when garbage", function() {
    this.gently.expect(this.parser, "emit", function(event, error) {
      assert.equal("error", event);
      assert.ok(error.message.indexOf(FakeData.Garbage) > -1);
    });
    this.parser.parse(FakeData.Garbage);
  });
