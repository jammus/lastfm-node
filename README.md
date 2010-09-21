# lastfm-node

Periodically monitors a user's recent plays feed on Last.fm.

## Installation

Using NPM

    npm install lastfm


## Events

* lastPlayed(track) - The user's last scrobbled track.
* nowPlaying(track) - Track the user is currently listening to.
* stoppedPlaying(track) - Last track scrobbled before the user stopped listening
* error(error) - Ruh-roh.

## Usage

    var LastFmNode = require('lastfm').LastFmNode;
    
    var lastfm = new LastFmNode({
      api_key: 'abc',
      user: 'username'
    });
    
    lastfm.addListener('lastPlayed', function(track) {
      console.log('Last played: ' + track.name);
    });
    
    lastfm.addListener('nowPlaying', function(track) {
      console.log('Now playing: ' + track.name);
    });

    lastfm.addListener('error', function(error) {
      console.log('Error: '  + error);
    });

    lastfm.stream();

## Influences

Heavily drawn from (almost ripped off, in fact) technoweenie's twitter-node  
http://github.com/technoweenie/twitter-node
