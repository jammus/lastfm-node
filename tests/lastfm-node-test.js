var assert = require('assert');
var ntest = require('ntest');
var crypto = require('crypto');
var querystring = require('querystring');

var LastFmNode = require('lastfm').LastFmNode;

ntest.describe("default LastFmNode instance")
  ntest.before(function() { this.lastfm = new LastFmNode(); })

  ntest.it("requests json", function() {
    assert.equal('json', this.lastfm.params.format);
  });

  ntest.it("has default host", function() {
    assert.equal('ws.audioscrobbler.com', this.lastfm.host);
  });

ntest.describe("LastFmNode requestUrl")
  ntest.before(function() { this.lastfm = new LastFmNode(); })

  ntest.it("appends stringified params to url", function() {
    this.lastfm.params = { foo : "bar", baz : "bash" };
    assert.equal("/2.0?foo=bar&baz=bash", this.lastfm.requestUrl());
  });

  ntest.it("appends additional params to url", function() {
    this.lastfm.params = { foo : "bar", baz : "bash" };
    additionalParams = { flip : "flop" };
    assert.equal("/2.0?foo=bar&baz=bash&flip=flop", this.lastfm.requestUrl(additionalParams));
  });

  ntest.it("leaves original additional params untouched", function() {
   this.lastfm.params = { foo: "bar" };
   var url = this.lastfm.requestUrl({ foo: "baz" });
   assert.equal("bar", this.lastfm.params.foo);         
  });

ntest.describe("merge params")
  ntest.before(function() { this.lastfm = new LastFmNode(); })

  ntest.it("merges two param objects", function() {
    var merged = this.lastfm.mergeParams({'foo': 'bar'}, {'bar': 'baz'});
    assert.equal('bar', merged.foo);
    assert.equal('baz', merged.bar);
  });

  ntest.it("second param takes precedence", function() {
    var merged = this.lastfm.mergeParams({'foo': 'bar'}, {'foo': 'baz'});
    assert.equal('baz', merged.foo);
  });

ntest.describe("LastFmNode signature hash")
  // see http://www.last.fm/api/webauth#6
  ntest.before(function() { 
    this.lastfm = new LastFmNode({ secret: 'secret' });
    var that = this;
    this.params = null;
    this.whenParamsAre = function(params) {
      that.params = params;
    };

    this.expectHashOf = function(unhashed) {
      var expectedHash = crypto.createHash("md5").update(unhashed).digest("hex");
      var actualHash = that.lastfm.signature(that.params);
      assert.equal(expectedHash, actualHash);
    };
  })

  ntest.it("includes params plus secret", function() {
    this.whenParamsAre({ foo : "bar" });
    this.expectHashOf("foobarsecret");
  });

  ntest.it("orders params alphabetically", function() {
    this.whenParamsAre({ foo : "bar", baz: "bash", flip : "flop"});
    this.expectHashOf("bazbashflipflopfoobarsecret");
  });

  ntest.it("ignores format parameter", function() {
    this.whenParamsAre({ foo : "bar", baz : "bash", format: "json" });
    this.expectHashOf("bazbashfoobarsecret");
  });

ntest.describe("LastFmNode options")
  ntest.before(function() {
    this.options = {
      api_key: 'abcdef12345',
      secret: 'ghijk67890'
    };
    this.lastfm = new LastFmNode(this.options);
  })

  ntest.it("configures api key", function() {
    assert.equal('abcdef12345', this.lastfm.params.api_key);
  });

  ntest.it("configures secret", function() {
    assert.equal('ghijk67890', this.lastfm.secret);
  });
