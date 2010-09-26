# lastfm-node

Periodically monitors a user's recent plays feed on Last.fm.

## Installation

Using NPM

    npm install lastfm


## Events

* lastPlayed(track) - The user's last scrobbled track.
* nowPlaying(track) - Track the user is currently listening to.
* scrobbled(track) - Now playing track has been scrobbled.
* stoppedPlaying(track) - User stopped listening to current track.
* error(error) - Ruh-roh.

## Usage

    var LastFmNode = require('lastfm').LastFmNode;
    
    var lastfm = new LastFmNode({
      api_key: 'abc'
    });

    var trackStream = lastfm.getRecentTrackStream({user: 'username'});
    
    trackStream.addListener('lastPlayed', function(track) {
      console.log('Last played: ' + track.name);
    });
    
    trackStream.addListener('nowPlaying', function(track) {
      console.log('Now playing: ' + track.name);
    });

    trackStream.addListener('scrobbled', function(track) {
      console.log('Scrobbled: ' + track.name);
    });

    trackStream.addListener('stoppedPlaying', function(track) {
      console.log('Stopped playing: ' + track.name);
    });

    trackStream.addListener('error', function(error) {
      console.log('Error: '  + error);
    });

    trackStream.stream();

## Influences

Heavily drawn from (almost ripped off, in fact) technoweenie's twitter-node  
http://github.com/technoweenie/twitter-node
