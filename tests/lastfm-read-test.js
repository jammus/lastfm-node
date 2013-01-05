require('./common');
var crypto = require("crypto");
var _ = require("underscore");
var querystring = require("querystring");
var fakes = require("./fakes");
var LastFmRequest = fakes.LastFmRequest;

(function() {
  var gently, lastfm;
  var options, expectations;
  var notExpected;

  describe("a lastfm request");

  before(function() {
    gently = new Gently();
    options = {};
    expectations = {
      pairs:[],
      handlers:[]
    };
    notExpected = {
      keys:[]
    }
    lastfm = new LastFmNode({
      api_key: "key",
      secret: "secret"
    });
    gently.expect(GENTLY_HIJACK.hijacked.http, "request", function(options, cb) {
      verifyCreateClient(options.port, options.host);
      var request = new fakes.ClientRequest();
      if (options.method == "POST") {
          gently.expect(request, "write", function(data) {
              verifyRequest(options.method, options.path, options.headers, data);
          });
      } else {
          verifyRequest(options.method, options.path, options.headers);
      }
      return request;
    });
  });

  after(function() {
    var request = doRequest();
    verifyHandlers(request);
  });

  function verifyCreateClient(port, host) {
    if (expectations.port) {
      assert.equal(expectations.port, port);
    }
    if (expectations.host) {
      assert.equal(expectations.host, host);
    }
  }

  function verifyRequest(method, url, header, data) {
    if (expectations.url) {
      assert.equal(expectations.url, url);
    }
    var pairs = querystring.parse(data || url.substr("/2.0?".length));
    _(Object.keys(expectations.pairs)).each(function(key) {
        assert.equal(expectations.pairs[key], pairs[key]);
    });
    if (expectations.signed || expectations.signatureHash) {
      assert.ok(pairs.api_sig);
    }
    else if (expectations.signed === false) {
      assert.ok(!pairs.api_sig);
    }
    if (expectations.signatureHash) {
      assert.equal(expectations.signatureHash, pairs.api_sig);
    }
    if (expectations.method) {
      assert.equal(expectations.method, method);
    }
    _(notExpected.keys).each(function(key) {
      assert.ok(!pairs[key]);
    });
    if (expectations.requestData) {
      assert.ok(data);
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

  function expectUrl(url) {
    expectations.url = url;
  }

  function expectSignatureHashOf(unhashed) {
    var expectedHash = crypto.createHash("md5").update(unhashed, "utf8").digest("hex");
    expectSignatureHashToBe(expectedHash);
  };

    this.expectSignatureHashToBe = function(hash) {
      expectations.signatureHash = hash;
    }

  function expectRequestOnPort(port) {
    expectations.port = port;
  }

  function expectRequestToHost(host) {
    expectations.host = host;
  }

  function expectHandlerFor(event) {
    expectations.handlers.push(event);
  }

  function expectRequestData() {
    expectations.requestData = true;
  }

  function doNotExpectDataKey(key) {
    notExpected.keys.push(key);
  }

  function doRequest() {
    return lastfm.request(options.method, options.params);
  }

  function verifyHandlers(request) {
    _(expectations.handlers).each(function(event) {
      var listeners = request.listeners(event);
      assert.equal(1, listeners.length, "No handler for event: " + event);
    });
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

  it("converts track object to separate parameters", function() {
    whenMethodIs("any.method");
    andParamsAre({
      track: {
        artist: { "#text": "The Mae Shi" },
        name: "Run To Your Grave",
        mbid: "1234567890"
      }
    });
    expectDataPair("artist", "The Mae Shi");
    expectDataPair("track", "Run To Your Grave");
    expectDataPair("mbid", "1234567890");
  });

  it("converts track object album details to separate parameters", function() {
    whenMethodIs("any.method");
    andParamsAre({
      track: {
        artist: { "#text": "The Mae Shi" },
        name: "Run To Your Grave",
        album: { "#text": "HLLLYH" }
      }
    });
    expectDataPair("album", "HLLLYH");
  });

  it("does not overwrite explicitly set album parameters", function() {
    whenMethodIs("any.method");
    andParamsAre({
      track: {
        artist: { "#text": "The Mae Shi" },
        name: "Run To Your Grave",
        album: { "#text": "HLLLYH" }
      },
      album: "Run To Your Grave"
    });
    expectDataPair("album", "Run To Your Grave");
  });

  it("doesn't include mbid if one isn't supplied", function() {
    whenMethodIs("any.method");
    andParamsAre({
      track: {
        artist: { "#text": "The Mae Shi" },
        name: "Run To Your Grave"
      }
    });
    expectDataPair("artist", "The Mae Shi");
    expectDataPair("track", "Run To Your Grave");
    doNotExpectDataKey("mbid");
  });

  it("does not pass through event handler parameters", function() {
    whenMethodIs("any.method");
    andParamsAre({ handlers: "handlers", error: "error", success: "success" });
    doNotExpectDataKey("handlers");
    doNotExpectDataKey("error");
    doNotExpectDataKey("success");
  });

  it("auth.getsession has signature", function() {
    whenMethodIs("auth.getsession");
    expectSignature();
  });

  it("attaches handlers to returned request", function() {
    whenMethodIs("any.method");
    andParamsAre({ handlers: {
        error: function() {console.log("errrors");},
        success: function() {},
        arbitrary: function() {},
    }});
    expectHandlerFor("error");
    expectHandlerFor("success");
    expectHandlerFor("arbitrary");
  });

  it("uses signed param to force signature", function() {
    whenMethodIs("any.method");
    andParamsAre({
      signed: true
    });
    expectSignature();
  });

  it("signature hashes api_key, method and secret", function() {
    whenMethodIs("auth.getsession");
    expectSignatureHashOf("api_keykeymethodauth.getsessionsecret");
  });

  it("signature includes other parameters", function() {
    whenMethodIs("auth.getsession");
    andParamsAre({ foo: "bar" });
    expectSignatureHashOf("api_keykeyfoobarmethodauth.getsessionsecret");
  });

  it("signature hashes all params alphabetically", function() {
    whenMethodIs("auth.getsession");
    andParamsAre({ foo : "bar", baz: "bash", flip : "flop" });
    expectSignatureHashOf("api_keykeybazbashflipflopfoobarmethodauth.getsessionsecret");
  });

  it("signature hash ignores format parameter", function() {
    whenMethodIs("auth.getsession");
    andParamsAre({ format: "json" });
    expectSignatureHashOf("api_keykeymethodauth.getsessionsecret");
  });

  it("signature hash ignores handlers parameter", function() {
    whenMethodIs("auth.getsession");
    andParamsAre({ handlers: "handlers" });
    expectSignatureHashOf("api_keykeymethodauth.getsessionsecret");
  });

  it("signature hash ignores write parameter", function() {
    whenMethodIs("auth.getsession");
    andParamsAre({ write: true });
    expectSignatureHashOf("api_keykeymethodauth.getsessionsecret");
  });

  it("signature hash ignores signed parameter", function() {
    whenMethodIs("any.method");
    andParamsAre({ signed: true });
    expectSignatureHashOf("api_keykeymethodany.methodsecret");
  });

  it("signature hash handles high characters as expected by last.fm (utf8)", function() {
    whenMethodIs("auth.getsession");
    andParamsAre({ track: "Tony’s Theme (Remastered)" });
    expectSignatureHashToBe("15f5159046bf1e76774b9dd46a4ed993");
  });

  it("signature hash treats undefined values as blank", function() {
    whenMethodIs("any.method");
    andParamsAre({ signed: true, track: 'Replicating Networks', artist: 'Rabbit Milk', albumArtist: undefined });
    expectSignatureHashOf("albumArtistapi_keykeyartistRabbit Milkmethodany.methodtrackReplicating Networkssecret");
  });

  it("signature hash treats null values as blank", function() {
    whenMethodIs("any.method");
    andParamsAre({ signed: true, track: 'Replicating Networks', artist: 'Rabbit Milk', albumArtist: null });
    expectSignatureHashOf("albumArtistapi_keykeyartistRabbit Milkmethodany.methodtrackReplicating Networkssecret");
  });

  it("write requests use post", function() {
    whenMethodIs("any.method");
    andParamsAre({ write: true });
    expectHttpMethod("POST");
  });

  it("write requests don't use get parameters", function() {
    whenMethodIs("any.method");
    andParamsAre({ write: true });
    expectUrl("/2.0");
  });

  it("write requests send data in request", function() {
    whenMethodIs("any.method");
    andParamsAre({
      write: true,
      foo: "bar"
    });
    expectRequestData();
    expectDataPair("foo", "bar");
  });

  it("write requests are always signed", function() {
    whenMethodIs("album.removeTag");
    andParamsAre({
      write: true
    });
    expectSignature();
  });

  _(["album.addTags", "album.removeTag", "album.share",
    "artist.addTags", "artist.removeTag", "artist.share", "artist.shout",
    "event.attend", "event.share", "event.shout",
    "library.addAlbum", "library.addArtist", "library.addTrack",
    "playlist.addTrack", "playlist.create",
    "radio.tune",
    "track.addTags", "track.ban", "track.love", "track.removeTag",
    "track.scrobble", "track.share", "track.unban", "track.unlove",
    "track.updateNowPlaying",
    "user.shout"]).each(function(method) {
    it(method + " is a write (post) request", function() {
      whenMethodIs(method);
      expectHttpMethod("POST");
    });
  });

  _(["auth.getMobileSession", "auth.getSession", "auth.getToken",
    "radio.getPlaylist"]).each(function(method) {
    it(method + " is signed", function() {
      whenMethodIs(method);
      expectSignature();
    });
  });
})();
