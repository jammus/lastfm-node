require('./common.js');

var querystring = require('querystring');
var crypto = require("crypto");

describe("default LastFmNode instance")
  before(function() { this.lastfm = new LastFmNode(); })

  it("has default host", function() {
    assert.equal('ws.audioscrobbler.com', this.lastfm.host);
  });

describe("LastFmNode requestUrl")
  before(function() { this.lastfm = new LastFmNode(); })

  it("appends stringified params to url", function() {
    this.lastfm.params = { foo : "bar", baz : "bash" };
    assert.equal("/2.0?foo=bar&baz=bash", this.lastfm.requestUrl());
  });

  it("appends additional params to url", function() {
    this.lastfm.params = { foo : "bar", baz : "bash" };
    additionalParams = { flip : "flop" };
    assert.equal("/2.0?foo=bar&baz=bash&flip=flop", this.lastfm.requestUrl(additionalParams));
  });

  it("leaves original additional params untouched", function() {
   this.lastfm.params = { foo: "bar" };
   var url = this.lastfm.requestUrl({ foo: "baz" });
   assert.equal("bar", this.lastfm.params.foo);         
  });

describe("merge params")
  before(function() { this.lastfm = new LastFmNode(); })

  it("merges two param objects", function() {
    var merged = this.lastfm.mergeParams({'foo': 'bar'}, {'bar': 'baz'});
    assert.equal('bar', merged.foo);
    assert.equal('baz', merged.bar);
  });

  it("second param takes precedence", function() {
    var merged = this.lastfm.mergeParams({'foo': 'bar'}, {'foo': 'baz'});
    assert.equal('baz', merged.foo);
  });

describe("LastFmNode signature hash")
  // see http://www.last.fm/api/webauth#6
  before(function() { 
    this.lastfm = new LastFmNode({ secret: 'secret' });
    var that = this;
    this.params = null;
    this.whenParamsAre = function(params) {
      that.params = params;
    };

    this.expectHashOf = function(unhashed) {
      var expectedHash = crypto.createHash("md5").update(unhashed, "utf8").digest("hex");
      that.expectHashToBe(expectedHash);
    };

    this.expectHashToBe = function(hash) {
      var actualHash = that.lastfm.signature(that.params);
      assert.equal(hash, actualHash);
    }
  })

  it("includes params plus secret", function() {
    this.whenParamsAre({ foo : "bar" });
    this.expectHashOf("foobarsecret");
  });

  it("orders params alphabetically", function() {
    this.whenParamsAre({ foo : "bar", baz: "bash", flip : "flop"});
    this.expectHashOf("bazbashflipflopfoobarsecret");
  });

  it("ignores format parameter", function() {
    this.whenParamsAre({ foo : "bar", baz : "bash", format: "json" });
    this.expectHashOf("bazbashfoobarsecret");
  });

  it("handles high characters as expected by last.fm", function() {
    this.whenParamsAre({ track: 'Tony’s Theme (Remastered)' });
    this.expectHashOf("trackTony’s Theme (Remastered)secret");
    this.expectHashToBe("9f92abf69e1532ec6e4686453c117688");
  });

describe("LastFmNode options")
  before(function() {
    this.options = {
      api_key: 'abcdef12345',
      secret: 'ghijk67890'
    };
    this.lastfm = new LastFmNode(this.options);
  })

  it("configures api key", function() {
    assert.equal('abcdef12345', this.lastfm.params.api_key);
  });

  it("configures secret", function() {
    assert.equal('ghijk67890', this.lastfm.secret);
  });
