require('./common.js');
var LastFmInfo = require('lastfm/lastfm-info').LastFmInfo;

describe("a new info instance")
  before(function() {
    this.lastfm = new LastFmNode();
    this.gently = new Gently();
  });
  
  it("emits error for unknown info type", function() {
    var handler = { error: function() {}};
    this.gently.expect(handler, "error", function(error) {
      assert.equal("Unknown item type", error.message);
    });
    var info = new LastFmInfo(this.lastfm, "unknown", { error: handler.error });
  });
  
  it("allows requests for user info", function() {
    this.gently.expect(this.lastfm, "readRequest");
    var info = new LastFmInfo(this.lastfm, "user");
  });

  it("allows requests for track info", function() {
    var info = new LastFmInfo(this.lastfm, "track");
  });
  
