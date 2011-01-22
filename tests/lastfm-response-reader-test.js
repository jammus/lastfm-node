require("./common");
var EventEmitter = require('events').EventEmitter;
ResponseReader = require('../lib/lastfm-node/response-reader').ResponseReader;

(function() {
describe("receiver")
  var mockRequest, reader, mockResponse, gently, error;
  before(function() {
    mockRequest = new EventEmitter();
    data = '';
    error = null;
    reader = new ResponseReader(mockRequest, function(receivedData, receivedError) {
      data = receivedData;    
      error = receivedError;
    });

    mockResponse = new EventEmitter();
    mockRequest.emit("response", mockResponse);
    gently = new Gently();
  });

  it("fires callback on end", function() {
    mockResponse.emit("data", FakeData.SingleRecentTrack);
    mockResponse.emit("end");
    assert.ok(data);
  });

  it("passes received data to callback", function() {
    mockResponse.emit("data", FakeData.SingleRecentTrack);
    mockResponse.emit("end");
    assert.equal(FakeData.SingleRecentTrack, data);
  });

  it("accepts input in chunks", function() {
    var first_chunk = FakeData.SingleRecentTrack.substr(0, 8);
    var second_chunk = FakeData.SingleRecentTrack.substr(8);
    mockResponse.emit("data", first_chunk);
    mockResponse.emit("data", second_chunk);
    mockResponse.emit("end");
    assert.ok(data);
    assert.equal(FakeData.SingleRecentTrack, data);
  });

  it("sends request errors as parameter of callback", function() {
    mockRequest.emit("error", new Error("Request Error"));
    assert.equal(null, data);
    assert.ok(error);
    assert.equal("Request Error", error.message);
  });

  it("sends response errors as parameter of callback", function() {
    mockResponse.emit("error", new Error("Response Error"));
    assert.equal(null, data);
    assert.ok(error);
    assert.equal("Response Error", error.message);
  });
})();
