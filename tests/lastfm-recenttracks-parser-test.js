var RecentTracksParser = require('../lib/lastfm-node/recenttracks-parser').RecentTracksParser;
var assert = require('assert');
var ntest = require('ntest');
var FakeData = require('./TestData.js').FakeData;

ntest.describe("parser")
  ntest.before(function() { this.parser = new RecentTracksParser(); })

  ntest.it("throws exception when empty", function() {
    assert.throws(function() { this.parser.parse('') });
    })

  ntest.it("thows exception when no recenttracks object", function() {
    assert.throws(function() { this.parser.parser(FakeData.UnknownObject); });
    })

  ntest.it("returns object for value of recenttracks.track", function() {
    assert.equal(42, this.parser.parse(FakeData.SingleRecentTrack));
   })

  ntest.it("returns multiple track when array", function() {
    var tracks = this.parser.parse(FakeData.MultipleRecentsTracks);
    assert.equal("first", tracks[0]);
    assert.equal("second", tracks[1]);
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
    this.parser.receive(FakeData.SingleRecentTrack + '\n');
    assert.ok(emitted);
  }) 

  ntest.it("won't emit track without terminator", function() {
    var emitted = false;
    this.parser.addListener('track', function(track) {
      emitted = true; 
    });
    this.parser.receive(FakeData.SingleRecentTrack);
    assert.ok(!emitted);
  })

  ntest.it("accepts input in chunks", function() {
    var emitted = false;
    this.parser.addListener('track', function(track) {
      emitted = true; 
    });

    var first_chunk = FakeData.SingleRecentTrack.substr(0, 8);
    var second_chunk = FakeData.SingleRecentTrack.substr(8);
    this.parser.receive(first_chunk);
    this.parser.receive(second_chunk + '\n');
    assert.ok(emitted);
  })

  ntest.it("can emit multiple tracks", function() {
    var trackCount = 0;
    this.parser.addListener('track', function(track) {
      trackCount++; 
    });
    this.parser.receive(FakeData.SingleRecentTrack + '\n');
    this.parser.receive(FakeData.SingleRecentTrack + '\n');
    assert.equal(2, trackCount);
  })

  ntest.it("emits error on receipt of garbage", function() {
    var errored = false;
    this.parser.addListener('error', function() {
      errored = true; 
    });
    this.parser.receive(FakeData.Garbage + '\n');
    assert.ok(errored);
  })

