var RecentTracksParser = require('../lib/lastfm-node/recenttracks-parser').RecentTracksParser;
var assert = require('assert');
var ntest = require('ntest');

var TestData = Object.create;
TestData.SingleRecentTrack = '{\"recenttracks\":{\"track\":42}}';
TestData.UnknownObject = '{\"recentevents\":{\"event\":{}}}';
TestData.MultipleRecentsTracks = '{\"recenttracks\":{\"track\":[\"first\", \"second\"]}}';
TestData.Garbage = 'fi30i\ 32';
ntest.describe("parser")
  ntest.before(function() { this.parser = new RecentTracksParser(); })

  ntest.it("throws exception when empty", function() {
    assert.throws(function() { this.parser.parse('') });
    })

  ntest.it("returns object for value of recenttracks.track", function() {
    assert.equal(42, this.parser.parse(TestData.SingleRecentTrack));
   })

  ntest.it("returns first track when array", function() {
    assert.equal('first', this.parser.parse(TestData.MultipleRecentsTracks));
  })

ntest.describe("receiver")
  ntest.before(function() { this.parser = new RecentTracksParser(); })
  
  ntest.it("accepts listeners", function() {
    this.parser.addListener('someevent', function() {
    });
  })
  
  ntest.it("emits track event on valid track", function() {
    var emitted = false;
    this.parser.addListener('track', function(track) {
      emitted = true; 
    });
    this.parser.receive(TestData.SingleRecentTrack + '\n');
    assert.ok(emitted);
  }) 

  ntest.it("won't emit track without terminator", function() {
    var emitted = false;
    this.parser.addListener('track', function(track) {
      emitted = true; 
    });
    this.parser.receive(TestData.SingleRecentTrack);
    assert.ok(!emitted);
  })

  ntest.it("accepts input in chunks", function() {
    var emitted = false;
    this.parser.addListener('track', function(track) {
      emitted = true; 
    });

    var first_chunk = TestData.SingleRecentTrack.substr(0, 8);
    var second_chunk = TestData.SingleRecentTrack.substr(8);
    this.parser.receive(first_chunk);
    this.parser.receive(second_chunk + '\n');
    assert.ok(emitted);
  })

  ntest.it("can emit multiple tracks", function() {
    var trackCount = 0;
    this.parser.addListener('track', function(track) {
      trackCount++; 
    });
    this.parser.receive(TestData.SingleRecentTrack + '\n');
    this.parser.receive(TestData.SingleRecentTrack + '\n');
    assert.equal(2, trackCount);
  })

  ntest.it("emits error on receipt of garbage", function() {
    var errored = false;
    this.parser.addListener('error', function() {
      errored = true; 
    });
    this.parser.receive(TestData.Garbage + '\n');
    assert.ok(errored);
  })

