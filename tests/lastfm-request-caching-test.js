require('./common');
var LastFmCache = require('../lib/lastfm/lastfm-cache')
  , LastFmRequest = require("../lib/lastfm/lastfm-request")
  , crypto = require("crypto")
  , fakes = require("./fakes");

(function() {
  var gently, cache, lastfm, connection;

  describe('a LastFm request when caching is enabled');

  before(function() {
    connection = new fakes.Client(80, 'any.host');
    gently = new Gently();
    GENTLY_HIJACK.hijacked.http.createClient = function() {
      return connection;
    };
    cache = new LastFmCache();
    lastfm = new LastFmNode({
      api_key: 'key',
      cache: cache
    });
  });

  it('attempts to get from the cache', function() {
    gently.expect(cache, 'get');
    var lastfmRequest = new LastFmRequest(lastfm, 'any.method');
  });

  it('cache key is a hash of the eligible parameters', function() {
    var params = {
      track: {
        mbid: '',
        artist: {
          '#text': 'The Mae Shi'
        },
        name: '7xx7'
      },
      username: 'user',
      format: 'json',
      handlers: { }
    };
    var expectedMessage = 'api_keykeyartistThe Mae Shiformatjsonmbidmethodany.methodtrack7xx7usernameuser';
    gently.expect(cache, 'get', function(key) {
      assert.equal(crypto.createHash('md5').update(expectedMessage, 'utf8').digest('hex'), key);
    });
    var lastfmRequest = new LastFmRequest(lastfm, 'any.method', params);
  });
})();
