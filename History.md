# Changelog

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

