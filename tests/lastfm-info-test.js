require("./common.js");
var LastFmInfo = require("lastfm/lastfm-info");
var LastFmRequest = require("lastfm/lastfm-request");
var fakes = require("./fakes");

describe("a new info instance")
  before(function() {
    this.lastfm = new LastFmNode();
    this.gently = new Gently();
  });

  it("accepts listeners in options", function() {
    var handlers = { error: function() {}, success: function() {} };
    this.gently.expect(handlers, "error");
    this.gently.expect(handlers, "success");
    var info = new LastFmInfo(this.lastfm, "", handlers);
    info.emit("success");
  });
  
  it("emits error if type not specified", function() {
    var handler = { error: function() {}};
    this.gently.expect(handler, "error", function(error) {
      assert.equal("Item type not specified", error.message);
    });
    var info = new LastFmInfo(this.lastfm, "", { error: handler.error });
  });
  
  it("allows requests for user info", function() {
    this.gently.expect(this.lastfm, "read", function() {
      return new fakes.LastFmRequest();
    });
    var info = new LastFmInfo(this.lastfm, "user");
  });

  it("allows requests for track info", function() {
    this.gently.expect(this.lastfm, "read", function() {
      return new fakes.LastFmRequest();
    });
    var info = new LastFmInfo(this.lastfm, "track");
  });

  it("allows all [itemtype].getinfo calls", function() {
    this.gently.expect(this.lastfm, "read", function(params) {
      assert.equal("event.getinfo", params.method);
      return new fakes.LastFmRequest();
    });
    new LastFmInfo(this.lastfm, "event");
  });
  
  it("calls unsigned methods", function() {
    this.gently.expect(this.lastfm, "read", function(params, signed) {
      assert.equal(false, signed);
      return new fakes.LastFmRequest();
    });
    var info = new LastFmInfo(this.lastfm, "user");
  });

  it("passes through parameters", function() {
    this.gently.expect(this.lastfm, "read", function(params) {
      assert.equal("username", params.user);
      assert.equal("anything", params.arbitrary);
      return new fakes.LastFmRequest();
    });
    new LastFmInfo(this.lastfm, "user", { user: "username", arbitrary: "anything" });
  });

  it("doesnt pass through callback parameters", function() {
    this.gently.expect(this.lastfm, "read", function(params) {
      assert.ok(!params.error);
      assert.ok(!params.success);
      return new fakes.LastFmRequest();
    });
    new LastFmInfo(this.lastfm, "user", { error: function() {}, success: function() {} });
  });

describe("when receiving data")
  before(function() {
    this.gently = new Gently();
    this.lastfm = new LastFmNode();
    this.request = new fakes.LastFmRequest();
  });

  it("emits error if response contains error", function() {
    var that = this;
    this.gently.expect(this.lastfm, "read", function(params, signed) {
      return that.request;
    });
    new LastFmInfo(this.lastfm, "track", {
      error: this.gently.expect(function errorHandler(error) {
        assert.equal("You must supply either a track & artist name or a track mbid.", error.message);
      })
    });
    this.request.emit("success", FakeData.NotEnoughTrackInfo);
  });

  it("emits error when receiving unexpected data", function() {
    var that = this;
    this.gently.expect(this.lastfm, "read", function(params, signed) {
      return that.request;
    });
    new LastFmInfo(this.lastfm, "track", {
      error: this.gently.expect(function errorHandler(error) {
        assert.equal("Unexpected error", error.message);
      })
    });
    this.request.emit("success", FakeData.SuccessfulAuthorisation);
  });

  it("emits error if receiving junk", function() {
      var that = this;
      this.gently.expect(this.lastfm, "read", function(params, signed) {
        return that.request;
      });
      new LastFmInfo(this.lastfm, "track", {
        error: this.gently.expect(function errorHandler(error) {
          assert.ok(error.message.indexOf(FakeData.Garbage) > -1);
          assert.ok("Syntax error");
        })
      });
      this.request.emit("success", FakeData.Garbage);
  });

  it("emits success with received data when matches expected type", function() {
    var that = this;
    this.gently.expect(this.lastfm, "read", function(params, signed) {
        return that.request;
    });
    new LastFmInfo(this.lastfm, "track", {
      success: this.gently.expect(function success(track) {
        assert.equal("Run To Your Grave", track.name);
        assert.equal("232000", track.duration);
      })
    });
    this.request.emit("success", FakeData.RunToYourGraveTrackInfo);
  });

  it("bubbles up errors", function() {
    var that = this;
    this.gently.expect(this.lastfm, "read", function(params, signed) {
        return that.request;
    });
    var info = new LastFmInfo(this.lastfm, "track");
    this.gently.expect(info, "emit", function(event, error) {
      assert.equal("error", event);
      assert.equal("Bubbled error", error.message);
    });
    that.request.emit("error", new Error("Bubbled error"));
  });
