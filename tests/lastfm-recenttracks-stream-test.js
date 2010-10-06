var LastFmNode = require('lastfm').LastFmNode;
var RecentTracksParser = require('../lib/lastfm-node/recenttracks-parser').RecentTracksParser;
var FakeTracks = require('./TestData.js').FakeTracks;

var assert = require('assert');
var ntest = require('ntest');

ntest.describe("default stream instance");
  ntest.before(function() {
    this.lastfm = new LastFmNode();
    this.trackStream = new RecentTracksStream(this.lastfm, { user: 'username' });
  });

  ntest.it("requests recent tracks", function() {
    assert.equal('user.getrecenttracks', this.trackStream.params.method);
  });

  ntest.it("configures user", function() {
    assert.equal('username', this.trackStream.params.user);
  });

  ntest.it("checks every ten seconds", function() {
    assert.equal(10, this.trackStream.rate);
  });

  ntest.it("only requests the most recent track", function() {
    assert.equal(1, this.trackStream.params.limit);
  });

  ntest.it("accepts listeners", function() {
    this.trackStream.addListener('event', function() {});
  })
  
ntest.describe("Active stream");
  ntest.before(function() { 
    var context = this;

    this.parser = new RecentTracksParser();
    this.lastfm = new LastFmNode();
    this.trackStream = new RecentTracksStream(this.lastfm, {
        user: "username",
        parser: this.parser
    });

    context.errored = null;
    this.trackStream.addListener('error', function(error) {
      context.errored = error;
    });
   
    context.lastPlay = null;
    context.lastPlayCount = 0;
    this.trackStream.addListener('lastPlayed', function(track) {
      context.lastPlay = track;
      context.lastPlayCount++;
    });

    context.nowPlaying = null;
    context.nowPlayingCount = 0;
    this.trackStream.addListener('nowPlaying', function(track) {
      context.nowPlaying = track;
      context.nowPlayingCount++;
    });

    context.stoppedPlaying = null;
    context.stoppedPlayingCount = 0;
    this.trackStream.addListener('stoppedPlaying', function(track) {
      context.stoppedPlaying = track;
      context.stoppedPlayingCount++;
    });

    context.scrobbled = null;
    context.scrobbledCount = 0;
    this.trackStream.addListener('scrobbled', function(track) {
      context.scrobbled = track;
      context.scrobbledCount++;
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

  ntest.it("emits now playing and last played if both received", function() {
    this.parser.emit('track', FakeTracks.NowPlayingAndScrobbled);
    assert.ok(this.lastPlay);
    assert.equal('Over The Moon', this.lastPlay.name);
    assert.ok(this.nowPlaying);
    assert.equal('Theme Song', this.nowPlaying.name);
  });

  ntest.it("does not re-emit lastPlayed on receipt of same track", function() {
    this.parser.emit('track', FakeTracks.LambAndTheLion);
    this.parser.emit('track', FakeTracks.LambAndTheLion);
    assert.equal(1, this.lastPlayCount);
  });

  ntest.it("does not re-emit nowPlaying on receipt of same track", function() {
    this.parser.emit('track', FakeTracks.RunToYourGrave_NP);
    this.parser.emit('track', FakeTracks.RunToYourGrave_NP);
    assert.equal(1, this.nowPlayingCount);
  });

  ntest.it("emits stoppedPlaying with last scrobbled track when now playing stops", function() {
    this.parser.emit('track', FakeTracks.RunToYourGrave_NP);
    this.parser.emit('track', FakeTracks.RunToYourGrave);
    assert.equal(1, this.stoppedPlayingCount);
    assert.equal('Run To Your Grave', this.stoppedPlaying.name);
  });

  ntest.it("emits scrobbled when last play changes", function() {
    this.parser.emit('track', FakeTracks.LambAndTheLion);
    this.parser.emit('track', FakeTracks.RunToYourGrave_NP);
    this.parser.emit('track', FakeTracks.RunToYourGrave);
    assert.equal(1, this.scrobbledCount);
    assert.equal('Run To Your Grave', this.scrobbled.name);
  });
  
  ntest.it("emits nowPlaying when track same as lastPlayed", function() {
    this.parser.emit('track', FakeTracks.RunToYourGrave);
    this.parser.emit('track', FakeTracks.RunToYourGrave_NP);
    assert.equal(1, this.lastPlayCount);
    assert.equal(1, this.nowPlayingCount);
  });
