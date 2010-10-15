var FakeData = exports.FakeData  = Object.create; 
FakeData.SingleRecentTrack = '{\"recenttracks\":{\"track\":42}}';
FakeData.UnknownObject = '{\"recentevents\":{\"event\":{}}}';
FakeData.MultipleRecentsTracks = '{\"recenttracks\":{\"track\":[\"first\", \"second\"]}}';
FakeData.Garbage = 'fi30i\ 32';

var FakeTracks = exports.FakeTracks = Object.create;
FakeTracks.LambAndTheLion = { name: 'Lamb and the Lion'};

FakeTracks.RunToYourGrave_NP = {"artist":{"#text":"The Mae Shi","mbid":"8eb5c47c-4847-4c4b-a041-879d8fc5fbf3"},"name":"Run To Your Grave","streamable":"1","mbid":"","album":{"#text":"HILLYH","mbid":""},"url":"http:\/\/www.last.fm\/music\/The+Mae+Shi\/_\/Run+To+Your+Grave","image":[{"#text":"http:\/\/userserve-ak.last.fm\/serve\/34s\/4656031.jpg","size":"small"},{"#text":"http:\/\/userserve-ak.last.fm\/serve\/64s\/4656031.jpg","size":"medium"},{"#text":"http:\/\/userserve-ak.last.fm\/serve\/126\/4656031.jpg","size":"large"},{"#text":"http:\/\/userserve-ak.last.fm\/serve\/300x300\/4656031.jpg","size":"extralarge"}],"@attr":{"nowplaying":"true"}};

FakeTracks.RunToYourGrave = {"artist":{"#text":"The Mae Shi","mbid":"8eb5c47c-4847-4c4b-a041-879d8fc5fbf3"},"name":"Run To Your Grave","streamable":"1","mbid":"","album":{"#text":"HILLYH","mbid":""},"url":"http:\/\/www.last.fm\/music\/The+Mae+Shi\/_\/Run+To+Your+Grave","image":[{"#text":"http:\/\/userserve-ak.last.fm\/serve\/34s\/4656031.jpg","size":"small"},{"#text":"http:\/\/userserve-ak.last.fm\/serve\/64s\/4656031.jpg","size":"medium"},{"#text":"http:\/\/userserve-ak.last.fm\/serve\/126\/4656031.jpg","size":"large"},{"#text":"http:\/\/userserve-ak.last.fm\/serve\/300x300\/4656031.jpg","size":"extralarge"}]};

FakeTracks.NowPlayingAndScrobbled = [{"artist":{"#text":"Super Tennis","mbid":""},"name":"Theme Song","streamable":"1","mbid":"","album":{"#text":"The Quiet Finale","mbid":""},"url":"http:\/\/www.last.fm\/music\/Super+Tennis\/_\/Theme+Song","image":[{"#text":"http:\/\/userserve-ak.last.fm\/serve\/34s\/41788301.jpg","size":"small"},{"#text":"http:\/\/userserve-ak.last.fm\/serve\/64s\/41788301.jpg","size":"medium"},{"#text":"http:\/\/userserve-ak.last.fm\/serve\/126\/41788301.jpg","size":"large"},{"#text":"http:\/\/userserve-ak.last.fm\/serve\/300x300\/41788301.jpg","size":"extralarge"}],"@attr":{"nowplaying":"true"}},{"artist":{"#text":"Colour","mbid":""},"name":"Over The Moon","streamable":"1","mbid":"","album":{"#text":"The 6 Machine","mbid":""},"url":"http:\/\/www.last.fm\/music\/Colour\/_\/Over+The+Moon","image":[{"#text":"http:\/\/userserve-ak.last.fm\/serve\/34s\/32970217.jpg","size":"small"},{"#text":"http:\/\/userserve-ak.last.fm\/serve\/64s\/32970217.jpg","size":"medium"},{"#text":"http:\/\/userserve-ak.last.fm\/serve\/126\/32970217.jpg","size":"large"},{"#text":"http:\/\/userserve-ak.last.fm\/serve\/300x300\/32970217.jpg","size":"extralarge"}]}];

FakeData.AuthorisationError = "{ \"error\" : 13, \"message\" : \"Signature is invalid\" }";

FakeData.SuccessfulAuthorisation = "{ \"session\":  { \"name\": \"username\", \"key\": \"sessionkey\", \"subscriber\": \"0\"} }"; 

FakeData.UpdateError = "{ \"error\" : 13, \"message\" : \"Invalid method signature supplied\" }";

FakeData.UpdateNowPlayingSuccess = "{\"nowplaying\":{\"track\":{\"#text\":\"Run To Your Grave\",\"corrected\":\"0\"},\"artist\":{\"#text\":\"The Mai Shi\",\"corrected\":\"0\"},\"album\":{\"#text\":\"\",\"corrected\":\"0\"},\"albumArtist\":{\"#text\":\"\",\"corrected\":\"0\"},\"ignoredMessage\":{\"#text\":\"\",\"code\":\"0\"}}}";

FakeData.ScrobbleSuccess= "{\"scrobbles\":{\"scrobble\":{\"track\":{\"#text\":\"Run To Your Grave\",\"corrected\":\"0\"},\"artist\":{\"#text\":\"The Mai Shi\",\"corrected\":\"0\"},\"album\":{\"#text\":\"\",\"corrected\":\"0\"},\"albumArtist\":{\"#text\":\"\",\"corrected\":\"0\"},\"timestamp\":\"1287180538\",\"ignoredMessage\":{\"#text\":\"\",\"code\":\"0\"}},\"@attr\":{\"accepted\":\"1\",\"ignored\":\"0\"}}}";
