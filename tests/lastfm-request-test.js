require("./common");
var _ = require("underscore"),
    LastFmRequest = require("../lib/lastfm/lastfm-request"),
    fakes = require("./fakes");

(function() {
  describe("a LastFm request")

  var lastfm, connection, url, gently, request;

  before(function() {
    lastfm = new LastFmNode();
    connection = new fakes.Client(80, lastfm.host);
    request = new fakes.ClientRequest();
    gently = new Gently();
  });

  it("creates a get request", function() {
    gently.expect(GENTLY_HIJACK.hijacked.http, "request", function(options, cb) {
      assert.equal("GET", options.method);
      assert.equal(lastfm.host, options.host);
      return request;
    });
    var lastfmRequest = new LastFmRequest(lastfm, "any.method");
  });

  it("ends the request", function() {
    gently.expect(GENTLY_HIJACK.hijacked.http, "request", function() {
      return request;
    });
    gently.expect(request, "end");
    var lastfmRequest = new LastFmRequest(lastfm);
  });

  it("defaults user agent to lastfm-node", function() {
    gently.expect(GENTLY_HIJACK.hijacked.http, "request", function(options, cb) {
      assert.equal("lastfm-node", options.headers["User-Agent"]);
      return request;
    });
    var lastFmRequest = new LastFmRequest(lastfm, "any.method");
  });

  it("can specify user agent in lastfm options", function() {
    var useragent = "custom-user-agent";
    gently.expect(GENTLY_HIJACK.hijacked.http, "request", function(options, cb) {
      assert.equal(useragent, options.headers["User-Agent"]);
      return request;
    });
    var lastfm = new LastFmNode({ useragent: useragent });
    var lastFmRequest = new LastFmRequest(lastfm, "any.method");
  });

  it("bubbles up connection errors", function() {
    var message = "Bubbled error";
    gently.expect(GENTLY_HIJACK.hijacked.http, "request", function(options, cb) {
        return request;
    });
    var lastfmRequest = new LastFmRequest(lastfm, "any.method");
    gently.expect(lastfmRequest, "emit", function(event, error) {
      assert.equal("error", event);
      assert.equal(message, error.message);
    });
    request.emit("error", new Error(message));
  });
})();

(function() {
  describe("a LastFm request with a body")

  var lastfm, connection, url, gently, request, params;

  before(function() {
    lastfm = new LastFmNode();
    connection = new fakes.Client(80, lastfm.host);
    request = new fakes.ClientRequest();
    gently = new Gently();
    params = { foo:"bar" };
  });

  it("write parameter forces a post request", function() {
    gently.expect(GENTLY_HIJACK.hijacked.http, "request", function(options, cb) {
      assert.equal("POST", options.method);
      assert.equal(lastfm.url, options.path);
      assert.equal(lastfm.host, options.host);
      return request;
    });
    params.write = true;
    var lastFmRequest = new LastFmRequest(lastfm, "any.method", params);
  });

  it("post requests includes additional headers", function() {
    gently.expect(GENTLY_HIJACK.hijacked.http, "request", function(options, cb) {
      assert.ok(options.headers["Content-Length"]);
      assert.equal("application/x-www-form-urlencoded", options.headers["Content-Type"]);
      return request;
    });
    params.write = true;
    var lastFmRequest = new LastFmRequest(lastfm, "any.method", params);
  });

  it("writes body to request", function() {
    gently.expect(GENTLY_HIJACK.hijacked.http, "request", function() {
        return request;
    });
    gently.expect(request, "write", function(data) {
        assert.ok(data);
    });
    params.write = true;
    var lastFmRequest = new LastFmRequest(lastfm, "any.method", params);
  });
})();

(function() {
  var lastfm, connection, url, gently, request, receivedData;

  describe("A Lastfm request which returns data")

  before(function() {
    lastfm = new LastFmNode();
    connection = new fakes.Client(80, lastfm.host);
    request = new fakes.ClientRequest();
    gently = new Gently();
  });

  it("emits data as json", function() {
    whenReceiving("{\"testdata\":\"received\"}");
    expectRequestToEmit(function(event, data) {
      assert.equal("success", event);
      assert.equal("received", data.testdata);
    });
  });

  it("emits error if received data cannot be parsed to json", function() {
    whenReceiving("{\"testdata\"");
    expectRequestToEmit(function(event, error) {
      assert.equal("error", event);
      assert.ok(error);
    });
  });

  it("emits error if json response contains a lastfm error", function() {
    whenReceiving("{\"error\": 2, \"message\": \"service does not exist\"}");
    expectRequestToEmit(function(event, error) {
      assert.equal("error", event);
      assert.equal("service does not exist", error.message);
    });
  });

  it("accepts data in chunks", function() {
    whenReceiving(["{\"testda", "ta\":\"recei", "ved\"}"]);
    expectRequestToEmit(function(event, data) {
      assert.equal("success", event);
      assert.equal("received", data.testdata);
    });
  });

  it("does not covert to json if requested is different format", function() {
    var xml = "<somexml />";
    lastfm.format = "xml";
    whenReceiving(xml);
    expectRequestToEmit(function(event, data) {
      assert.equal(xml, data);
    });
  });

  function whenReceiving(data) {
      if (data.constructor.name !== 'Array') {
          data = [data];
      }
      receivedData = data;
  }

  function expectRequestToEmit(expectation) {
    var response = new fakes.ClientResponse();
    gently.expect(GENTLY_HIJACK.hijacked.http, "request", function(options, cb) {
      cb(response);
      return request;
    });
    var lastfmRequest = new LastFmRequest(lastfm);
    gently.expect(lastfmRequest, "emit", expectation);
    _(receivedData).each(function(data) {
      response.emit("data", data);
    });
    response.emit("end");
  }
})();
