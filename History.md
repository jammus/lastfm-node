# Changelog

## 0.4.1

* Added slightly more descriptive errors to RecentTracksParser.

## 0.4.0

### Breaking changes

* `LastFmSession` is no longer responsible for sending update. Use `lastfm.update()`  instead.

    lastfm.update("nowplaying", session, { track: track });

### New Features

* Access getInfo API calls through `lastfm.info()`. See README for example.

