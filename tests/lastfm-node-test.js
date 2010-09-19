var LastFmNode = require('../lib/lastfm-node').LastFmNode;
var RecentTracksParser = require('../lib/lastfm-node/recenttracks-parser').RecentTracksParser;
var FakeTracks = require('./TestData.js').FakeTracks;

var assert = require('assert');
var sys = require('sys');

var ntest = require('ntest');

ntest.describe("default LastFmNode instance")
  ntest.before(function() { this.lastfm = new LastFmNode(); })

  ntest.it("requests from default url", function() {
    assert.ok(this.lastfm.requestUrl() != '');
  })

  ntest.it("requests json", function() {
    assert.ok(this.lastfm.buildParams().indexOf('format=json') > -1);
  })

  ntest.it("requests recent tracks", function() {
    assert.ok(this.lastfm.buildParams().indexOf('method=user.getrecenttracks') > -1);
  })

  ntest.it("has default host", function() {
    assert.equal('ws.audioscrobbler.com', this.lastfm.host);
  })

  ntest.it("only requests the most recent track", function() {
    assert.ok(this.lastfm.buildParams().indexOf('limit=1') > -1);
  })

  ntest.it("checks every ten seconds", function() {
    assert.equal(10, this.lastfm.rate);
  })

  ntest.it("accepts listeners", function() {
    this.lastfm.addListener('event', function() {});
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

ntest.describe("fresh LastFmNode instance")
  ntest.setup(function() { 
    var context = this;

    this.parser = new RecentTracksParser();
    this.lastfm = new LastFmNode({parser: this.parser});
   
    context.errored = null;
    this.lastfm.addListener('error', function(error) {
      context.errored = error;
    });

    context.lastPlay = null;
    this.lastfm.addListener('lastPlayed', function(track) {
      context.lastPlay = track;
    });

    context.nowPlaying = null;
    this.lastfm.addListener('nowPlaying', function(track) {
      context.nowPlaying = track;
    });
  });

  ntest.it("bubbles errors", function() {
    this.parser.emit('error', new Error());
    assert.ok(this.errored);
  })

  ntest.it("emits last played when track received", function() {
    this.parser.emit('track', FakeTracks.LambAndTheLion);
    assert.ok(this.lastPlay);
    assert.equal('Lamb and the Lion', this.lastPlay.name);
  });

  ntest.it("emits now playing if track flagged now playing", function() {
    this.parser.emit('track', FakeTracks.RunToYourGrave_NP);

    assert.ok(!this.lastPlay);
    assert.ok(this.nowPlaying);
    assert.equal('Run To Your Grave', this.nowPlaying.name); 
  });
