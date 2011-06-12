require("./common");
var LastFmRequest = require("lastfm/lastfm-request");
var fakes = require("./fakes");

(function() {
  describe("a LastFm request")

  var lastfm, connection, url, gently, request;

  before(function() {
    lastfm = new LastFmNode();
    connection = new fakes.Client(80, lastfm.host);
    request = new fakes.ClientRequest();
    gently = new Gently();
    gently.expect(GENTLY_HIJACK.hijacked.http, "createClient", function() {
        return connection;
    });
  });

  it("creates a get request", function() {
    gently.expect(connection, "request", function(method, url, options) {
      assert.equal("GET", method);
      assert.equal(lastfm.host, options.host);
      return request;
    });
    var lastfmRequest = new LastFmRequest(lastfm, "any.method");
  });

  it("ends the request", function() {
    gently.expect(connection, "request", function() {
        return request;
    });
    gently.expect(request, "end");
    var lastfmRequest = new LastFmRequest(lastfm);
  });

  it("emits data received when response is complete", function() {
    var chunkOne = "test";
    var chunkTwo = "data";
    gently.expect(connection, "request", function() {
        return request;
    });
    var lastfmRequest = new LastFmRequest(lastfm);
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
    gently.expect(connection, "request", function() {
        return request;
    });
    var lastfmRequest = new LastFmRequest(lastfm);
    gently.expect(lastfmRequest, "emit", function(event, error) {
      assert.equal("error", event);
      assert.equal(message, error.message);
    });
    connection.emit("error", new Error(message));
  });

  it("defaults user agent to lastfm-node", function() {
    gently.expect(connection, "request", function(method, url, options) {
      assert.equal("lastfm-node", options["User-Agent"]);
      return request;
    });
    var lastFmRequest = new LastFmRequest(lastfm, "any.method");
  });

  it("can specify user agent in lastfm options", function() {
    var useragent = "custom-user-agent";
    gently.expect(connection, "request", function(method, url, options) {
      assert.equal(useragent, options["User-Agent"]);
      return request;
    });
    var lastfm = new LastFmNode({ useragent: useragent });
    var lastFmRequest = new LastFmRequest(lastfm, "any.method");
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
    gently.expect(GENTLY_HIJACK.hijacked.http, "createClient", function() {
        return connection;
    });
  });

  it("write parameter forces a post request", function() {
    gently.expect(connection, "request", function(method, url, options) {
      assert.equal("POST", method);
      assert.equal(lastfm.url, url);
      assert.equal(lastfm.host, options.host);
      return request;
    });
    params.write = true;
    var lastFmRequest = new LastFmRequest(lastfm, "any.method", params);
  });

  it("post requests includes additional headers", function() {
    gently.expect(connection, "request", function(method, url, options) {
      assert.ok(options["Content-Length"]);
      assert.equal("application/x-www-form-urlencoded", options["Content-Type"]);
      return request;
    });
    params.write = true;
    var lastFmRequest = new LastFmRequest(lastfm, "any.method", params);
  });

  it("writes body to request", function() {
    gently.expect(connection, "request", function() {
      return request;
    });
    gently.expect(request, "write", function(data) {
        assert.ok(data);
    });
    params.write = true;
    var lastFmRequest = new LastFmRequest(lastfm, "any.method", params);
  });
})();
