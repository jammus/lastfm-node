# lastfm-node

Read and write to users recent plays on Last.fm.

## Installation

    npm install lastfm

## Usage

    var LastFmNode = require('lastfm').LastFmNode;
  
    var lastfm = new LastFmNode({
      api_key: 'apikey',    // sign-up for a key at http://www.last.fm/api
      secret: 'secret',
      useragent: 'appname/vX.X MyApp' // optional. defaults to lastfm-node.
    });

## Documentation

### LastFmRequest

    lastfm.request(method, options);

Returns a `LastFmRequest` instance.

Send request to Last.fm. Requests automatically include the API key and are signed and/or sent via POST as described in the Last.fm API documentation.

Methods:

Accepts any Last.fm API method name, eg "artist.getInfo". 

Options:

All options are passed through to Last.fm with the exception of the following.

- *write*

        Force request to act as a write method. Write methods are signed and sent via POST. Useful for new methods not yet recognised by lastfm-node.

- *signed*

        Force request to be signed. See Last.fm API docs for signature details. Useful for new methods not yet recognised by lastfm-node.

- *handlers*

        Default event handlers to attach to the request object on creation.

Events:

- *success(json)*

        JSON response from Last.fm

- *error(error)*

        Ruh-roh. Either a error returned by Last.fm or a transmission error.

### RecentTracksStream

    lastfm.stream(username);

Returns: a `RecentTracksStream` instance

Methods:

- *start()*

        Start streaming recent track info.

- *stop()*

        Stop streaming recent track info.

- *isStreaming()*

        Boolean. True is nowplaying/recent track data is being actively fetched.

- *on(event, listener)*

        Adds a listener for the specified event.

- *removeListener(event, listener)*

        Removes the listener for the specified event.

Options:

- *autostart*

        Start streaming automatically. Defaults to false.

- *handlers*

        Default event handlers to attach to the request object on creation.

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

    lastfm.session(options);

Returns: a `LastFmSession` instance.

If the user and session key are already known supply these in the options. Otherwise supply a token for authorisation. When a token is supplied the session will be authorised with Last.fm. If the user has not yet approved the token (desktop application flow) then authorisation will be automatically retried.

See the last.fm API documentation for more info on Last.fm authorisation flow.

Options:

- *user*

        User name, if known.

- *key*

        Session key, if known.

- *token*

        Token supplied by auth.getToken or web flow callback.

- *retryInterval*

        Time in milliseconds to leave between retries. Defaults to 10 seconds.

- *handlers*

        Default event handlers to attach to the session object on creation.


Public properties:

- *user*

        The username of the Last.fm user associated with the session.

- *key*

        The session key. Either passed in or generated using authorise().

Methods:

- *authorise(token, [options])*

        Deprecated. Use lastfm.session({ token: token }) instead.
        Authorises user with Last.fm api. See last.fm documentation. Options argument has handlers property that has default event handlers to attach to the LastFmSession instance.

- *on(event, handler)*

        Adds a listener for the specified event.

- *removeListener(event, handler)*

        Removes the listener for the specified event.

- *isAuthorised()*

        Returns true if the session has been authorised or a key was specified in the constructor.

- *cancel()*

        Prevent any further authorisation retries. Only applies if token supplied.

Events:

- *success(session)*

        Authorisation of session was successful.
        Note: Only emitted if a token was supplied in options. Username/key combinations supplied in options are assumed to be valid.

- *authorised(session)*

        Deprecated: Use success instead.
        Authorisation of session was successful.

- *retrying(retry)*

       Authorisation request was not successful but will be retried after a delay. Retry object contains the following properties:  
       `delay` - The time in milliseconds before the request will be retried.  
       `error` - The error code returned by the Last.fm API.  
       `message` - The error message returned by the Last.fm API.

- *error(track, error)*

        The authorisation was not successful and will not be retried.

### LastFmUpdate

    lastfm.update(method, session, options);

Returns a `LastFmUpdate` instance. 

Valid methods are 'nowplaying' and 'scrobble'.

An authorised `LastFmSession` instance is required to make a successful update.

If a scrobble request receives an 11 (service offline), 16 (temporarily unavailable) or 29 (rate limit exceeded) error code from Last.fm then the request is automatically retried until it is permanently rejected or accepted. The first retry attempt is made after 10 seconds with subsequent requests delayed by 30 seconds, 1 minute, 5 minutes, 15 minutes and then every 30 minutes.

Options:

Accepts all parameters used by track.updateNowPlaying and user.scrobble (see Last.Fm API) as well as:

- *track*
    
        Track for nowplaying and scrobble requests. Uses same format as returned by `RecentTracksStream` events.

- *timestamp*

        Required for scrobble requests. Timestamp is in unix time (seconds since 01-01-1970 and is in UTC time).

- *handlers*

        Default event handlers to attach to the request object on creation.

Events:

- *success(track)*

       Update request was successful. 

- *retrying(retry)*

       Scrobble request was not successful but will be retried after a delay. Retry object contains the following properties:  
       `delay` - The time in milliseconds before the request will be retried.  
       `error` - The error code returned by the Last.fm API.  
       `message` - The error message returned by the Last.fm API.

- *error(track, error)*

        Ruh-roh.

### LastFmInfo

    lastfm.info(itemtype, [options]);

Returns: a `LastFmInfo` instance.

Gets extended info about specified item.

Public properties:

- *itemtype*

        Any Last.fm item with a getInfo method. eg user, track, artist, etc.

Options:

- *handlers*

        Event handlers to attach to object at creation.

- *various*

       Params as specified in Last.fm API, eg user: "username"

Special cases:

When requesting track info the `track` param can be either the track name or a track object as returned by `RecentTracksStream`.


## Example

    var LastFmNode = require('lastfm').LastFmNode;
    
    var lastfm = new LastFmNode({
      api_key: 'abc',
      secret: 'secret'
    });

    var trackStream = lastfm.stream('username');
    
    trackStream.on('lastPlayed', function(track) {
      console.log('Last played: ' + track.name);
    });
    
    trackStream.on('nowPlaying', function(track) {
      console.log('Now playing: ' + track.name);
    });

    trackStream.on('scrobbled', function(track) {
      console.log('Scrobbled: ' + track.name);
    });

    trackStream.on('stoppedPlaying', function(track) {
      console.log('Stopped playing: ' + track.name);
    });

    trackStream.on('error', function(error) {
      console.log('Error: '  + error.message);
    });

    trackStream.start();

    var session = lastfm.session({
       token: token,
       handlers: {
          success: function(session) {
             lastfm.update('nowplaying', session, { track: track } );
             lastfm.update('scrobble', session, { track: track, timestamp: 12345678 });
          }
       }
    });

    var request = lastfm.request("artist.getInfo", {
        artist: "The Mae Shi",
        handlers: {
            success: function(data) {
                console.log("Success: " + data);
            },
            error: function(error) {
                console.log("Error: " + error.message);
            }
        }
    });

## Influences

Heavily drawn from technoweenie's twitter-node  
http://github.com/technoweenie/twitter-node

## Contributors

* Garret Wilkin (garrettwilkin) - http://geethink.com
* Uwe L. Korn (xhochy) - http://xhochy.com
* Max Kueng (maxkueng) - http://maxkueng.com
