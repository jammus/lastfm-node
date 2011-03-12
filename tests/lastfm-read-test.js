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
      verifyCreateClient(port, host);
      return client;
    });
    gently.expect(client, "request", function(method, url, header) {
      verifyClientRequest(method, url, header);
      return new fakes.ClientRequest();
    });
  });

  after(function() {
    verify();
  });

  function verifyCreateClient(port, host) {
    if (expectations.port) {
      assert.equal(expectations.port, port);
    }
    if (expectations.host) {
      assert.equal(expectations.host, host);
    }
  }

  function verifyClientRequest(method, url, header) {
    var qs = querystring.parse(url.substr("/2.0?".length));
    _(Object.keys(expectations.pairs)).each(function(key) {
        assert.equal(expectations.pairs[key], qs[key]);
    });
    if (expectations.signed) {
      assert.ok(qs.api_sig);
    }
    else {
      assert.ok(!qs.api_sig);
    }
    if (expectations.method) {
      assert.equal(expectations.method, method);
    }
  }

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

  function expectRequestOnPort(port) {
    expectations.port = port;
  }

  function expectRequestToHost(host) {
    expectations.host = host;
  }

  function verify() {
    lastfm.read(options.method, options.params);
  }

  it("default to port 80", function() {
    whenMethodIs("any.method");
    expectRequestOnPort(80);
  });

  it("makes request to audioscrobbler", function() {
    whenMethodIs("any.method");
    expectRequestToHost("ws.audioscrobbler.com");
  });

  it("always requests as json", function() {
    whenMethodIs("any.method");
    expectDataPair("format", "json");
  });

  it("always passes api_key", function() {
    whenMethodIs("any.method");
    expectDataPair("api_key", "key");
  });

  it("defaults to get request", function() {
    whenMethodIs("any.method");
    expectHttpMethod("GET");
  });

  it("calls the method specified", function() {
    whenMethodIs("user.getinfo");
    expectDataPair("method", "user.getinfo");
  });

  it("passes through parameters", function() {
    whenMethodIs("user.getinfo");
    andParamsAre({ user: "jammus" });
    expectDataPair("user", "jammus");
  });

  it("auth.getsession has signature", function() {
    whenMethodIs("auth.getsession");
    expectSignature();
  });
})();
