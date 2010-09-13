var LastFmNode = require('../lib/lastfm-node').LastFmNode;
var assert = require('assert');

var ntest = require('ntest');

ntest.describe("default LastFmNode instance")
  ntest.before(function() { this.lastfm = new LastFmNode(); })

  ntest.it("requests from default url", function() {
    assert.equal('/2.0', this.lastfm.requestUrl());
  })

  ntest.it("requests json", function() {
    assert.ok(this.lastfm.buildParams().indexOf('format=json') > -1);
  })

  ntest.it("requests recent tracks", function() {
    assert.ok(this.lastfm.buildParams().indexOf('method=user.getrecenttracks') > -1);
  })

ntest.describe("LastFmNode instance")
  ntest.before(function() {
    this.options = {
      api_key: 'abcdef12345',
      user: 'username'
    };

    this.lastfm = new LastFmNode(this.options);
  })

  ntest.it("configures api key", function() {
    assert.ok(this.lastfm.buildParams().indexOf('api_key=abcdef12345') > -1);
  })

  ntest.it("configures user", function() {
    assert.ok(this.lastfm.buildParams().indexOf('user=username') > -1);
  })
