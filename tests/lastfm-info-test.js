require("./common.js");
var LastFmInfo = require("lastfm/lastfm-info");
var LastFmRequest = require("lastfm/lastfm-request");
var fakes = require("./fakes");

(function() {
describe("a new info instance")
  var lastfm, gently;
  before(function() {
    lastfm = new LastFmNode();
    gently = new Gently();
  });

  it("accepts listeners in options", function() {
    var handlers = { error: function() {}, success: function() {} };
    gently.expect(handlers, "error");
    gently.expect(handlers, "success");
    var info = new LastFmInfo(lastfm, "", handlers);
    info.emit("success");
  });
  
  it("emits error if type not specified", function() {
    var handler = { error: function() {}};
    gently.expect(handler, "error", function(error) {
      assert.equal("Item type not specified", error.message);
    });
    var info = new LastFmInfo(lastfm, "", { error: handler.error });
  });
  
  it("allows requests for user info", function() {
    gently.expect(lastfm, "read", function() {
      return new fakes.LastFmRequest();
    });
    var info = new LastFmInfo(lastfm, "user");
  });

  it("allows requests for track info", function() {
    gently.expect(lastfm, "read", function() {
      return new fakes.LastFmRequest();
    });
    var info = new LastFmInfo(lastfm, "track");
  });

  it("allows all [itemtype].getinfo calls", function() {
    gently.expect(lastfm, "read", function(method, params) {
      assert.equal("event.getinfo", method);
      return new fakes.LastFmRequest();
    });
    new LastFmInfo(lastfm, "event");
  });
  
  it("passes through parameters", function() {
    gently.expect(lastfm, "read", function(method, params) {
      assert.equal("username", params.user);
      assert.equal("anything", params.arbitrary);
      return new fakes.LastFmRequest();
    });
    new LastFmInfo(lastfm, "user", { user: "username", arbitrary: "anything" });
  });

  it("doesnt pass through callback parameters", function() {
    gently.expect(lastfm, "read", function(method, params) {
      assert.ok(!params.error);
      assert.ok(!params.success);
      return new fakes.LastFmRequest();
    });
    new LastFmInfo(lastfm, "user", { error: function() {}, success: function() {} });
  });
})();

(function() {
describe("when receiving data")
  var gently, lastfm, request;
  before(function() {
    gently = new Gently();
    lastfm = new LastFmNode();
    request = new fakes.LastFmRequest();
  });

  it("emits error if response contains error", function() {
    gently.expect(lastfm, "read", function(params, signed) {
      return request;
    });
    new LastFmInfo(lastfm, "track", {
      error: gently.expect(function errorHandler(error) {
        assert.equal("You must supply either a track & artist name or a track mbid.", error.message);
      })
    });
    request.emit("success", FakeData.NotEnoughTrackInfo);
  });

  it("emits error when receiving unexpected data", function() {
    gently.expect(lastfm, "read", function(params, signed) {
      return request;
    });
    new LastFmInfo(lastfm, "track", {
      error: gently.expect(function errorHandler(error) {
        assert.equal("Unexpected error", error.message);
      })
    });
    request.emit("success", FakeData.SuccessfulAuthorisation);
  });

  it("emits error if receiving junk", function() {
      gently.expect(lastfm, "read", function(params, signed) {
        return request;
      });
      new LastFmInfo(lastfm, "track", {
        error: gently.expect(function errorHandler(error) {
          assert.ok(error.message.indexOf(FakeData.Garbage) > -1);
          assert.ok("Syntax error");
        })
      });
      request.emit("success", FakeData.Garbage);
  });

  it("emits success with received data when matches expected type", function() {
    gently.expect(lastfm, "read", function(params, signed) {
        return request;
    });
    new LastFmInfo(lastfm, "track", {
      success: gently.expect(function success(track) {
        assert.equal("Run To Your Grave", track.name);
        assert.equal("232000", track.duration);
      })
    });
    request.emit("success", FakeData.RunToYourGraveTrackInfo);
  });

  it("bubbles up errors", function() {
    gently.expect(lastfm, "read", function(params, signed) {
        return request;
    });
    var info = new LastFmInfo(lastfm, "track");
    gently.expect(info, "emit", function(event, error) {
      assert.equal("error", event);
      assert.equal("Bubbled error", error.message);
    });
    request.emit("error", new Error("Bubbled error"));
  });
})();
