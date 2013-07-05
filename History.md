# Changelog

## 0.9.0
* Add automatic retries to session authorisation.
* Deprecated session.authorise() in favour of supplying a token at creation.

## 0.8.4
* Added some user functions to list of signed methods (maxkueng)
* Added some library functions to list of write methods (maxkueng)

## 0.8.3
* Fix issue where undefined mbid in track object would cause scrobble
  to fail. (maxkueng)
* Fix issue where all undefined and null parameters would cause signatures
  to fail.
* Use http.request instead of deprecated http.createClient. (xhochy)
* lastfm-node now requires node v0.4.10 and above.

## 0.8.1
* Automatically set album parameter from track details when available.
* Experimental REPL.

## 0.8.0

### Breaking changes
* Removed old handler options which were deprecated in 0.6.0.

### New features
* Scrobble request which return error codes 11, 16 or 29 are automatically retried.

## 0.7.0

### Breaking changes
* The success event on `lastfm.request` now emits parsed JSON rather than raw text.
* `RecentTracksStream.isStreaming` has been removed in favour of `RecentTracksStream.isStreaming()`.

## 0.6.3

* Fixed bug where success/error handlers on lastfm.info and lastfm.update were being fired twice.
* Configurable user-agent string.
* LastFmUpdate can now accept any parameter. This will be passed through to Last.Fm. This allows artist/track info to be supplied without having to use the track object from RecentTrackStream.

## 0.6.2

Fixed path issue (regression)

## 0.6.1

* Reinstated LastFmSession.authorise() handler options which were accidentallly removed rather than deprecated. Thanks to Vytautas Jakutis for the spot.
* Fixed LastFmSession.authorise() documentation (Vytautas Jakutis)

## 0.6.0

### New features

* Added request() method. Provides low-level support for entire Last.Fm API.
* Event handler options on RecentTrackStream, LastFmUpdate and LastFmInfo have been deprecated and replaced with more generic `handlers` option. These will be removed soon.

## 0.5.1

* More accurate error reporting from RecentTrackParser
* v0.4.x support

## 0.5.0

* Renamed lastfm.readRequest/writeRequest to read/write.
* Replace response reader with LastFmRequest.

## 0.4.4

* Handles response errors (timeouts, etc) when communicating with Last.fm
* Fixed bug where unexpected data in LastFmInfo would crash application.

## 0.4.3

* Fixed bug where RecentTrackStream was working with null tracks.

## 0.4.2

* Added session.isAuthorised()

## 0.4.1

* Added slightly more descriptive errors to RecentTracksParser.

## 0.4.0

### Breaking changes

* `LastFmSession` is no longer responsible for sending update. Use `lastfm.update()`  instead.

    lastfm.update("nowplaying", session, { track: track });

### New Features

* Access getInfo API calls through `lastfm.info()`. See README for example.

