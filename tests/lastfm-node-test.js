var LastFmNode = require('lastfm').LastFmNode;
var RecentTracksParser = require('../lib/lastfm-node/recenttracks-parser').RecentTracksParser;
var FakeTracks = require('./TestData.js').FakeTracks;

var assert = require('assert');
var sys = require('sys');
var ntest = require('ntest');
var crypto = require('crypto');

ntest.describe("default LastFmNode instance")
  ntest.before(function() { this.lastfm = new LastFmNode(); })

  ntest.it("requests json", function() {
    assert.equal('json', this.lastfm.params.format);
  })

  ntest.it("has default host", function() {
    assert.equal('ws.audioscrobbler.com', this.lastfm.host);
  })

  ntest.it("requestUrl appends stringified params to url", function() {
    this.lastfm.params = { foo : "bar", baz : "bash" };
    assert.equal("/2.0?foo=bar&baz=bash", this.lastfm.requestUrl());
  });

  ntest.it("requestUrl appends additional params to url", function() {
    this.lastfm.params = { foo : "bar", baz : "bash" };
    additionalParams = { flip : "flop" };
    assert.equal("/2.0?foo=bar&baz=bash&flip=flop", this.lastfm.requestUrl(additionalParams));
  });

  ntest.it("additional params leaves original untouched", function() {
   this.lastfm.params = { foo: "bar" };
   var url = this.lastfm.requestUrl({ foo: "baz" });
   assert.equal("bar", this.lastfm.params.foo);         
  });

  ntest.it("signed requests include hash of params plus secret", function() {
    // see http://www.last.fm/api/webauth#6
    var lastfm = new LastFmNode({ secret: 'secret' });
    lastfm.params = { foo : "bar" };
    var expectedHash =  crypto.createHash("md5").update("foobarsecret").digest("hex");
    var url = lastfm.requestUrl(null, true);
    assert.equal("/2.0?foo=bar&api_sig=" + expectedHash, url);
  });

  ntest.it("signed request hash order params alphabetically", function() {
    // see http://www.last.fm/api/webauth#6
    var lastfm = new LastFmNode({ secret: 'secret' });
    lastfm.params = { foo : "bar", baz: "bash" };
    var url = lastfm.requestUrl({ flip : "flop"}, true);
    var expectedHash = crypto.createHash("md5").update("bazbashflipflopfoobarsecret").digest("hex");
    assert.equal("/2.0?foo=bar&baz=bash&flip=flop&api_sig=" + expectedHash, url);
  });

  ntest.it("signed requests ignores format parameeter", function() {
    var lastfm = new LastFmNode({ secret: 'secret' });
    lastfm.params = { foo : "bar", baz : "bash", format: "json" };
    var expectedHash = crypto.createHash("md5").update("bazbashfoobarsecret").digest("hex");
    var url = lastfm.requestUrl(null, true);
    assert.equal("/2.0?foo=bar&baz=bash&format=json&api_sig=" + expectedHash, url);
  });

ntest.describe("LastFmNode instance")
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
