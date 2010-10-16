# lastfm-node

Read and write to users recent plays on Last.fm.

## Installation

    npm install lastfm

### Dependencies

Requires hashlib. http://github.com/brainfucker/hashlib

## Usage

    var LastFmNode = require('lastfm').LastFmNode;
  
    var lastfm = new LastFmNode({
      api_key: 'apikey',    // sign-up for a key at http://www.last.fm/api
      secret: 'secret'
    });

## Documentation

### RecentTracksStream

    lastfm.subscribe(username);

Returns: a `RecentTracksStream` instance

Methods:

- *start()*

        Start streaming tracks.

- *addListener(event, handler)*

        Adds a listener for the specified event.

- *removeListener(event, handler)*

        Removes the listener for the specified event.

Options:

- *autostart*

        Start streaming automatically. Defaults to false.

Events:

- *lastPlayed(track)*

        The user's last scrobbled track.

- *nowPlaying(track)*

        Track the user is currently listening to.

- *scrobbled(track)*
        
        Now playing track has been scrobbled.

- *stoppedPlaying(track)*

        User stopped listening to current track.

- *error(error)*

        Ruh-roh.

### LastFmSession

    lastfm.session([user], [key]);

Returns: a `LastFmSession` instance.

If no key is supplied then the authorise() method must be used before submissions can be made. See the last.fm API documentation for more info.

Public properties:

- *user*

        The username of the Last.fm user associated with the session.

- *key*

        The session key. Either passed in or generated using authorise().

Methods:

- *authorise(token)*

        Authorises user with Last.fm api. See last.fm documentation.

- *addListener(event, handler)*

        Adds a listener for the specified event.

- *removeListener(event, handler)*

        Removes the listener for the specified event.

- *update(method, track, options)*

        Update nowPlaying or scrobble a track to authenticated user's plays.
        Valid methods are 'nowplaying' and 'scrobble'.
        Timestamp is a required option for scrobble requests. Timestamp is in unix time (seconds since 01-01-1970 and is in UTC time).

Events:

- *authorised(session)*

        Authorisation of session was successful.
        Note: Only emitted after a call to authorise(). Keys supplied in the constructor are assumed to be valid.

- *success(track)*

       Update request was successful. 

- *error(track, error)*

        Ruh-roh.


## Example

    var LastFmNode = require('lastfm').LastFmNode;
    
    var lastfm = new LastFmNode({
      api_key: 'abc',
      secret: 'secret'
    });

    var trackStream = lastfm.stream('username');
    
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
      console.log('Error: '  + error.message);
    });

    trackStream.start();

    var session = lastfm.session();
    session.authorise(token);
    session.addListener('authorised', function(session) {
        session.update('nowplaying', track);
        session.update('scrobble', track, { timestamp: 12345678 });
    });

## Influences

Heavily drawn from technoweenie's twitter-node  
http://github.com/technoweenie/twitter-node
