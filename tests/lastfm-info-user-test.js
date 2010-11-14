require("./common.js");
var LastFmInfo = require("lastfm/lastfm-info").LastFmInfo;

var basicSetup = function() {
  this.lastfm = new LastFmNode();
  this.error = null;
  this.object = null;
  var that = this;
  this.defaultOptions = {
    error: function(e) {
      that.error = e;
    }
    success: function(obj) {
      that.object = obj;
    }
  };
  this.gently = new Gently();
};

describe("a user info request")
  before(basicSetup);
  
  it("calls unsigned method user.getinfo", function() {
    this.gently.expect(this.lastfm, "readRequest", function(params, signed) {
      assert.equal("user.getinfo", params.method);
      assert.equal(false, signed);
    });
    var info = new LastFmInfo(this.lastfm, "user");
  });
  
  it("passes username if provided", function() {
    this.gently.expect(this.lastfm, "readRequest", function(params) {
      assert.equal("username", params.user);
    });
    var info = new LastFmInfo(this.lastfm, "user", { user: "username" });
  });

  it("emits error if unknown response received", function() {
    var options = this.defaultOptions;
    options.user = "username";
    this.gently.expect(this.lastfm, "readRequest", function(params, signed, callback) {
        callback(FakeData.UnknownObject);
    });
    var info = new LastFmInfo(this.lastfm, "user", options);
    assert.ok(this.error);
    assert.equal("Unexpected error", this.error.message);
  });

  it("emits error when lookup unsuccessful", function() {
    this.gently.expect(this.lastfm, "readRequest", function(params, signed, callback) {
      callback(FakeData.UnknownUser);
    });
    var info = new LastFmInfo(this.lastfm, "user", this.defaultOptions);
    assert.ok(this.error);
    assert.equal("No user with that name was found", this.error.message);
  });

  it("emits success if user received", function() {
    this.gently.expect(this.lastfm, "readRequest", function(params, signed, callback) {
      callback(FakeData.UserInfo);
    });
    var info = new LastFmInfo(this.lastfm, "user", this.defaultOptions);
    assert.ok(this.object);
    assert.equal("jammus", this.object.name);
  });
