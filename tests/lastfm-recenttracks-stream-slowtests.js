require("./common.js");

var _ = require("underscore")
  , RecentTracksStream = require("lastfm/recenttracks-stream")
  , fakes = require("./fakes");

(function() {
  var lastfm, gently, request;

  describe("Streaming")

  before(function() { 
    lastfm = new LastFmNode();
    gently = new Gently();
    request = new fakes.LastFmRequest();
  });

  it("queries API every 10 seconds", function() {
    var trackStream = new RecentTracksStream(lastfm, "username");
    var timestamps = [];
    gently.expect(lastfm, "request", 2, function(method, params) {
      timestamps.push((new Date).getTime());
      if (timestamps.length === 2) {
        trackStream.stop();
        var delay = timestamps[1] - timestamps[0];
        assert.ok(delay >= (10000 - 50) && delay <= (10000 + 50));
      }
      return request;
    });
    trackStream.start();
  });
})();
