var EventEmitter = require('events').EventEmitter
  , LastFmInfo = require('../lib/lastfm/lastfm-info')
  , LastFmNode = require('../lib/lastfm').LastFmNode
  , FakeData = require('./TestData.js').FakeData;

describe('LastFmInfo', function() {
  var lastfm, handlers, request;

  beforeEach(function() {
    lastfm = new LastFmNode();
    handlers = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy()
    };
    request = new EventEmitter();
    spyOn(lastfm, 'request').andCallFake(function() {
      return request;
    });
  });

  it('accepts listeners in handler options', function() {
    var info = new LastFmInfo(lastfm, 'artist', { 'handlers': handlers });
    info.emit('success');
    info.emit('error');
    expect(handlers.success).toHaveBeenCalled();
    expect(handlers.error).toHaveBeenCalled();
  });

  it('emits error if type not specified', function() {
    var info = new LastFmInfo(lastfm, '', { 'handlers': handlers });
    expect(handlers.error.mostRecentCall.args[0].message).toEqual('Item type not specified');
  });

  it('converts calls to [itemtype].getinfo', function() {
    var userInfo = new LastFmInfo(lastfm, 'user')
      , artistInfo = new LastFmInfo(lastfm, 'artist')
      , eventInfo = new LastFmInfo(lastfm, 'event');
    expect(lastfm.request.calls[0].args[0]).toEqual('user.getinfo');
    expect(lastfm.request.calls[1].args[0]).toEqual('artist.getinfo');
    expect(lastfm.request.calls[2].args[0]).toEqual('event.getinfo');
  });

  it('passes parameters through to the request', function() {
    var info = new LastFmInfo(lastfm, 'user', { 'user': 'username', 'arbitrary': 'anything' })
      , params = lastfm.request.mostRecentCall.args[1];
    expect(params.user).toEqual('username');
    expect(params.arbitrary).toEqual('anything');
  });

  it('doesn\'t pass through callback parameters', function() {
    var info = new LastFmInfo(lastfm, 'user', { 'handlers': handlers })
      , params = lastfm.request.mostRecentCall.args[1];
    expect(params.error).toBe(undefined);
    expect(params.success).toBe(undefined);
  });

  describe('track info requests', function() {
    it('can accept artist, track name and mbid', function() {
      var info = new LastFmInfo(lastfm, 'track', {
        'artist': 'The Mae Shi',
        'track': 'Run To Your Grave',
        'mbid': '1234567890',
        'handlers': handlers
      });
      var params = lastfm.request.mostRecentCall.args[1];
      expect(params.artist, 'The Mae Shi');
      expect(params.track, 'Run To Your Grave');
      expect(params.mbid, '1234567890');
    });
  });

  describe('when receiving data', function() {
    it('emits error when receiving unexpected data', function() {
      var info = new LastFmInfo(lastfm, 'track', { 'handlers': handlers });
      request.emit('success', JSON.parse(FakeData.SuccessfulAuthorisation));

      var error = handlers.error.mostRecentCall.args[0];
      expect(error.message).toEqual('Unexpected error');
    });

    it('emits success with received data', function() {
      var info = new LastFmInfo(lastfm, 'track', { 'handlers': handlers });
      request.emit('success', JSON.parse(FakeData.RunToYourGraveTrackInfo));

      var track = handlers.success.mostRecentCall.args[0];
      expect(track.name).toEqual('Run To Your Grave');
      expect(track.duration).toEqual('232000');
    });

    it('bubbles error', function() {
      var info = new LastFmInfo(lastfm, 'track', { 'handlers': handlers });
      request.emit('error', new Error('Bubbled error'));

      var error = handlers.error.mostRecentCall.args[0];
      expect(error.message).toEqual('Bubbled error');
    });
  });
});
