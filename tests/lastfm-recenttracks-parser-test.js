var RecentTracksParser = require('../lib/lastfm-node/recenttracks-parser').RecentTracksParser;
var assert = require('assert');
var ntest = require('ntest');
var FakeData = require('./TestData.js').FakeData;

ntest.describe("parser")
  ntest.before(function() { 
    this.parser = new RecentTracksParser();
    this.error = null;
    this.track = null;
    var that = this;
    this.parser.addListener("error", function(error) {
       that.error = error; 
    });
    this.parser.addListener("track", function(track) {
       that.track = track;
    });
  })

  ntest.it("throws exception when empty", function() {
      this.parser.parse('');
      assert.ok(this.error);
  })

  ntest.it("thows exception when no recenttracks object", function() {
    this.parser.parse(FakeData.UnknownObject);
    assert.ok(this.error);
  })

  ntest.it("returns object for value of recenttracks.track", function() {
    this.parser.parse(FakeData.SingleRecentTrack);
    assert.equal(42, this.track);
  })

  ntest.it("returns multiple track when array", function() {
    this.parser.parse(FakeData.MultipleRecentsTracks);
    assert.equal("first", this.track[0]);
    assert.equal("second", this.track[1]);
  })


