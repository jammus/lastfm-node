var LastFmNode = require('lastfm').LastFmNode;
var RecentTracksParser = require('../lib/lastfm-node/recenttracks-parser').RecentTracksParser;
var FakeTracks = require('./TestData.js').FakeTracks;

var assert = require('assert');
var sys = require('sys');
var ntest = require('ntest');

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
