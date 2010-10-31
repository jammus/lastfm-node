var assert = require('assert');
var ntest = require('ntest');
var FakeData = require('./TestData.js').FakeData;
var EventEmitter = require('events').EventEmitter;
ResponseReader = require('../lib/lastfm-node/response-reader').ResponseReader;

ntest.describe("receiver")
  ntest.before(function() {
    var mockRequest = new EventEmitter();
    this.data = '';
    var that = this;
    this.reader = new ResponseReader(mockRequest, function(data) {
      that.data = data;    
    });

    this.mockResponse = new EventEmitter();
    mockRequest.emit("response", this.mockResponse);
  });

  ntest.it("fires callback on end", function() {
    this.mockResponse.emit("data", FakeData.SingleRecentTrack);
    this.mockResponse.emit("end");
    assert.ok(this.data);
  });

  ntest.it("passes received data to callback", function() {
    this.mockResponse.emit("data", FakeData.SingleRecentTrack);
    this.mockResponse.emit("end");
    assert.equal(FakeData.SingleRecentTrack, this.data);
  });

  ntest.it("accepts input in chunks", function() {
    var first_chunk = FakeData.SingleRecentTrack.substr(0, 8);
    var second_chunk = FakeData.SingleRecentTrack.substr(8);
    this.mockResponse.emit("data", first_chunk);
    this.mockResponse.emit("data", second_chunk);
    this.mockResponse.emit("end");
    assert.ok(this.data);
    assert.equal(FakeData.SingleRecentTrack, this.data);
  });
