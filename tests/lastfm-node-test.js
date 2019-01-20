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

  it("has no port configure by default", function() {
    assert.equal(undefined, lastfm.port);
  });
})();

(function() {
  var lastfm;

  describe("LastFmNode options")

  before(function() {
    lastfm = new LastFmNode({
      api_key: "abcdef12345",
      secret: "ghijk67890",
      host: "test.audioscrobbler.com",
      port: 8080
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

  it("configures port", function() {
    assert.equal(8080, lastfm.port);
  });
})();
