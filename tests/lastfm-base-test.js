require('./common');
var LastFmBase = require("../lib/lastfm/lastfm-base");

(function() {
  describe("LastFmBase");

  it("is an event emitter", function() {
    var events = { expected: function(){} };
    var gently = new Gently();
    var lastfmBase = new LastFmBase();
    gently.expect(events, "expected");
    lastfmBase.on("test", function() {
      events.expected();
    });
    lastfmBase.emit("test");
  });
})();

(function() {
  describe("LastFmBase.registerHandlers");

  it("attaches events specified in handelers parameter", function() {
    var handlers = {
      error: function() { },
      success: function() { },
      anything: function() { }
    };
    var gently = new Gently();
    gently.expect(handlers, "error");
    gently.expect(handlers, "success");
    gently.expect(handlers, "anything");
    var lastfmBase = new LastFmBase();
    lastfmBase.registerHandlers(handlers);
    lastfmBase.emit("error");
    lastfmBase.emit("success");
    lastfmBase.emit("anything");
  });
})();

(function() {
  var lastfmBase, original;

  describe("LastFmBase.filterParameters");

  before(function() {
    lastfmBase = new LastFmBase();
    original = { one: 1, two: 2, three: 3 };
  });

  it("unfiltered object matches original object", function() {
    var copy = lastfmBase.filterParameters(original);
    assert.deepEqual(copy, original);
  });

  it("returns copy of original object", function() {
    var copy = lastfmBase.filterParameters(original);
    copy.four = 4;
    assert.notDeepEqual(copy, original);
  });

  it("filteres out blacklisted parameters", function() {
    var copy = lastfmBase.filterParameters(original, ["one", "three"]);
    assert.equal(typeof copy.one, "undefined");
    assert.equal(typeof copy.three, "undefined");
    assert.equal(copy.two, 2);
  });

  it("automatically removed error, success, handler parameters", function() {
    var copy = lastfmBase.filterParameters({
        error: emptyFn,
        success: emptyFn,
        handlers: { }
    });
    assert.equal(typeof copy.error, "undefined");
    assert.equal(typeof copy.success, "undefined");
    assert.equal(typeof copy.handlers, "undefined");
  });
})();
