require("./common");
var EventEmitter = require('events').EventEmitter;
ResponseReader = require('../lib/lastfm-node/response-reader').ResponseReader;

(function() {
describe("receiver")
  var mockRequest, reader, mockResponse;
  before(function() {
    mockRequest = new EventEmitter();
    data = '';
    reader = new ResponseReader(mockRequest, function(receivedData) {
      data = receivedData;    
    });

    mockResponse = new EventEmitter();
    mockRequest.emit("response", mockResponse);
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
})();
