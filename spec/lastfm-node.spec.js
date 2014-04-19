var LastFmNode = require('../lib/lastfm').LastFmNode;

describe('LastFmNode', function() {
  it('has a default host', function() {
    var lastfm = new LastFmNode();
    expect(lastfm.host).toEqual('ws.audioscrobbler.com');
  });

  describe('options parameter', function() {
    it('configures api key', function() {
      var lastfm = new LastFmNode({ 'api_key': 'abcdef12345' });
      expect(lastfm.api_key).toEqual('abcdef12345');
    });

    it('configures secret', function() {
      var lastfm = new LastFmNode({ 'secret': 'ghijk67890' });
      expect(lastfm.secret).toEqual('ghijk67890');
    });

    it('configures host', function() {
      var lastfm = new LastFmNode({ 'host': 'test.audioscrobbler.com' });
      expect(lastfm.host).toEqual('test.audioscrobbler.com');
    });
  });
});
