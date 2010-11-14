require("./common.js");
var LastFmInfo = require("lastfm/lastfm-info").LastFmInfo;

var basicSetup = function() {
  this.lastfm = new LastFmNode();
  this.gently = new Gently();
};

describe("a user info request")
  before(basicSetup);
  
  it("calls method user.getinfo", function() {
    this.gently.expect(this.lastfm, "readRequest", function(params, signed) {
      assert.equal("user.getinfo", params.method);
    });
    new LastFmInfo(this.lastfm, "user");
  });
  
  it("passes username if provided", function() {
    this.gently.expect(this.lastfm, "readRequest", function(params) {
      assert.equal("username", params.user);
    });
    new LastFmInfo(this.lastfm, "user", { user: "username" });
  });
