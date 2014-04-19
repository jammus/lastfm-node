var LastFmBase = require('../lib/lastfm/lastfm-base')
  , EventEmitter = require('events').EventEmitter;
  

describe('LastFmBase', function() {
  var lastfmBase;

  beforeEach(function() {
    lastfmBase = new LastFmBase();
  });

  it('is an event emitter', function() {
    expect(lastfmBase instanceof EventEmitter).toBe(true);
  });

  describe('#registerHandlers', function() {
    it('attaches events specified in handlers parameter', function() {
      var handlers = {
        error: jasmine.createSpy(),
        success: jasmine.createSpy(),
        anything: jasmine.createSpy()
      };

      lastfmBase.registerHandlers(handlers);

      lastfmBase.emit('error');
      expect(handlers.error).toHaveBeenCalled();

      lastfmBase.emit('success');
      expect(handlers.success).toHaveBeenCalled();

      lastfmBase.emit('anything');
      expect(handlers.anything).toHaveBeenCalled();
    });
  });

  describe('#filterParameters', function() {
    var original;

    beforeEach(function() {
      original = { 'one': 1, 'two': 2, 'three': 3 };
    });

    it('returns a copy of the object when no filters supplied', function() {
      var filtered = lastfmBase.filterParameters(original);
      expect(filtered).toEqual(original);
      original.four = 4;
      expect(filtered).not.toEqual(original);
    });

    it('removes blacklisted parameters', function() {
      var filtered = lastfmBase.filterParameters(original, ['one', 'three']);
      expect(filtered.one).toBe(undefined);
      expect(filtered.three).toBe(undefined);
      expect(filtered.two).toBe(2);
    });

    it('automatically removes error, success and handler parameters', function() {
      var filtered = lastfmBase.filterParameters({
        error: function() { },
        success: function() { },
        handlers: { }
      });
      expect(filtered.error).toBe(undefined);
      expect(filtered.success).toBe(undefined);
      expect(filtered.handlers).toBe(undefined);
    });
  });
});
