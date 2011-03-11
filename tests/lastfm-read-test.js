require('./common');
var _ = require("underscore");
var querystring = require("querystring");
var fakes = require("./fakes");
var LastFmRequest = fakes.LastFmRequest;

(function() {
  var gently, lastfm, client;
  var options, expectations;

  describe("a read request");

  before(function() {
    gently = new Gently();
    options = {};
    expectations = {
      pairs:[]
    };
    lastfm = new LastFmNode({
      api_key: "key"
    });
    client = new fakes.Client();
    gently.expect(GENTLY_HIJACK.hijacked.http, "createClient", function(port, host) {
      assert.equal(80, port);
      assert.ok("ws.audioscrobbler.com");
      return client;
    });
    gently.expect(client, "request", function(method, url, headers) {
      if (expectations.method) assert.equal(expectations.method, method);
      var qs = querystring.parse(url.substr(5));
      _(Object.keys(expectations.pairs)).each(function(key) {
          assert.equal(expectations.pairs[key], qs[key]);
      });
      if (expectations.signed) assert.ok(qs.api_sig);
      if (!expectations.signed) assert.ok(!qs.api_sig);
      return new fakes.ClientRequest();
    });
  });

  function whenMethodIs(method) {
    options.method = method;
  }

  function andParamsAre(params) {
    options.params = params;
  }

  function expectHttpMethod(method) {
    expectations.method = method;
  }

  function expectDataPair(key, value) {
    expectations.pairs[key] = value;
  }

  function expectSignature() {
    expectations.signed = true;
  }

  function verify() {
    lastfm.read(options.method, options.params);
  }

  it("always requests as json", function() {
    whenMethodIs("any.method");
    expectDataPair("format", "json");
    verify();
  });

  it("always passes api_key", function() {
    whenMethodIs("any.method");
    expectDataPair("api_key", "key");
    verify();
  });

  it("defaults to get request", function() {
    whenMethodIs("any.method");
    expectHttpMethod("GET");
    verify();
  });

  it("calls the method specified", function() {
    whenMethodIs("user.getinfo");
    expectDataPair("method", "user.getinfo");
    verify();
  });

  it("passes through parameters", function() {
    whenMethodIs("user.getinfo");
    andParamsAre({ user: "jammus" });
    expectDataPair("user", "jammus");
    verify();
  });

  it("auth.getsession has signature", function() {
    whenMethodIs("auth.getsession");
    expectSignature();
    verify();
  });
})();
