require("./common.js");

var querystring = require("querystring");

(function() {
  var lastfm;

  describe("default LastFmNode instance")
    
  before(function() {
    lastfm = new LastFmNode();
  })

  it("has default host", function() {
    assert.equal("ws.audioscrobbler.com", lastfm.host);
  });
})();

(function() {
  var lastfm;

  describe("LastFmNode options")

  before(function() {
    lastfm = new LastFmNode({
      api_key: "abcdef12345",
      secret: "ghijk67890",
      host: "test.audioscrobbler.com"
    });
  })

  it("configures api key", function() {
    assert.equal("abcdef12345", lastfm.api_key);
  });

  it("configures secret", function() {
    assert.equal("ghijk67890", lastfm.secret);
  });

  it("configures host", function() {
    assert.equal("test.audioscrobbler.com", lastfm.host);
  });
})();
