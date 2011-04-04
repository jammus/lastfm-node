require("./common");
var LastFmRequest = require("lastfm/lastfm-request");
var fakes = require("./fakes");

(function() {
  describe("a LastFm request")

  var host, connection, url, gently, request;

  before(function() {
    host = "www.example.com";
    connection = new fakes.Client(80, host);
    url = "/resource";
    request = new fakes.ClientRequest();
    gently = new Gently();
  });

  it("creates a get request", function() {
    gently.expect(connection, "request", function(method, requestUrl, options) {
        assert.equal("GET", method);
        assert.equal(url, requestUrl);
        assert.equal(host, options.host);
        return request;
    });
    var lastfmRequest = new LastFmRequest(connection, url);
  });

  it("ends the request", function() {
    gently.expect(connection, "request", function(method, requestUrl, options) {
        return request;
    });
    gently.expect(request, "end");
    var lastfmRequest = new LastFmRequest(connection, url);
  });

  it("emits data received when response is complete", function() {
    var chunkOne = "test";
    var chunkTwo = "data";
    gently.expect(connection, "request", function(method, requestUrl, options) {
        return request;
    });
    var lastfmRequest = new LastFmRequest(connection, url);
    gently.expect(lastfmRequest, "emit", function(event, data) {
      assert.equal("success", event);
      assert.equal(chunkOne + chunkTwo, data);
    });
    var response = new fakes.ClientResponse();
    request.emit("response", response);
    response.emit("data", chunkOne);
    response.emit("data", chunkTwo);
    response.emit("end");
  });

  it("bubbles up connection errors", function() {
    var message = "Bubbled error";
    gently.expect(connection, "request", function(method, requestUrl, options) {
        return request;
    });
    var lastfmRequest = new LastFmRequest(connection, url);
    gently.expect(lastfmRequest, "emit", function(event, error) {
      assert.equal("error", event);
      assert.equal(message, error.message);
    });
    connection.emit("error", new Error(message));
  });
})();

(function() {
  describe("a LastFm request with a body")

  var host, connection, url, gently, request, body;

  before(function() {
    host = "www.example.com";
    connection = new fakes.Client(80, host);
    url = "/resource";
    request = new fakes.ClientRequest();
    gently = new Gently();
    body = "foo=bar";
  });

  it("creates a post request", function() {
    gently.expect(connection, "request", function(method, requestUrl, options) {
      assert.equal("POST", method);
      assert.equal(url, requestUrl);
      assert.equal(host, options.host);
      return request;
    });
    var lastFmRequest = new LastFmRequest(connection, url, body);
  });

  it("includes additional headers", function() {
    gently.expect(connection, "request", function(method, requestUrl, options) {
      assert.equal(body.length, options["Content-Length"]);
      assert.equal("application/x-www-form-urlencoded", options["Content-Type"]);
      return request;
    });
    var lastFmRequest = new LastFmRequest(connection, url, body);
  });

  it("writes body to request", function() {
    gently.expect(connection, "request", function() {
      return request;
    });
    gently.expect(request, "write", function(data) {
        assert.equal(body, data);
    });
    var lastFmRequest = new LastFmRequest(connection, url, body);
  });
})();
