var FakeData = exports.FakeData  = Object.create; 
FakeData.SingleRecentTrack = '{\"recenttracks\":{\"track\":42}}';
FakeData.UnknownObject = '{\"recentevents\":{\"event\":{}}}';
FakeData.MultipleRecentsTracks = '{\"recenttracks\":{\"track\":[\"first\", \"second\"]}}';
FakeData.Garbage = 'fi30i\ 32';

var FakeTracks = exports.FakeTracks = Object.create;
FakeTracks.LambAndTheLion = { name: 'Lamb and the Lion'};

FakeTracks.RunToYourGrave_NP = {"artist":{"#text":"The Mae Shi","mbid":"8eb5c47c-4847-4c4b-a041-879d8fc5fbf3"},"name":"Run To Your Grave","streamable":"1","mbid":"","album":{"#text":"HILLYH","mbid":""},"url":"http:\/\/www.last.fm\/music\/The+Mae+Shi\/_\/Run+To+Your+Grave","image":[{"#text":"http:\/\/userserve-ak.last.fm\/serve\/34s\/4656031.jpg","size":"small"},{"#text":"http:\/\/userserve-ak.last.fm\/serve\/64s\/4656031.jpg","size":"medium"},{"#text":"http:\/\/userserve-ak.last.fm\/serve\/126\/4656031.jpg","size":"large"},{"#text":"http:\/\/userserve-ak.last.fm\/serve\/300x300\/4656031.jpg","size":"extralarge"}],"@attr":{"nowplaying":"true"}};

FakeTracks.RunToYourGrave = {"artist":{"#text":"The Mae Shi","mbid":"8eb5c47c-4847-4c4b-a041-879d8fc5fbf3"},"name":"Run To Your Grave","streamable":"1","mbid":"fakembid","album":{"#text":"HILLYH","mbid":""},"url":"http:\/\/www.last.fm\/music\/The+Mae+Shi\/_\/Run+To+Your+Grave","image":[{"#text":"http:\/\/userserve-ak.last.fm\/serve\/34s\/4656031.jpg","size":"small"},{"#text":"http:\/\/userserve-ak.last.fm\/serve\/64s\/4656031.jpg","size":"medium"},{"#text":"http:\/\/userserve-ak.last.fm\/serve\/126\/4656031.jpg","size":"large"},{"#text":"http:\/\/userserve-ak.last.fm\/serve\/300x300\/4656031.jpg","size":"extralarge"}]};

FakeTracks.NowPlayingAndScrobbled = [{"artist":{"#text":"Super Tennis","mbid":""},"name":"Theme Song","streamable":"1","mbid":"","album":{"#text":"The Quiet Finale","mbid":""},"url":"http:\/\/www.last.fm\/music\/Super+Tennis\/_\/Theme+Song","image":[{"#text":"http:\/\/userserve-ak.last.fm\/serve\/34s\/41788301.jpg","size":"small"},{"#text":"http:\/\/userserve-ak.last.fm\/serve\/64s\/41788301.jpg","size":"medium"},{"#text":"http:\/\/userserve-ak.last.fm\/serve\/126\/41788301.jpg","size":"large"},{"#text":"http:\/\/userserve-ak.last.fm\/serve\/300x300\/41788301.jpg","size":"extralarge"}],"@attr":{"nowplaying":"true"}},{"artist":{"#text":"Colour","mbid":""},"name":"Over The Moon","streamable":"1","mbid":"","album":{"#text":"The 6 Machine","mbid":""},"url":"http:\/\/www.last.fm\/music\/Colour\/_\/Over+The+Moon","image":[{"#text":"http:\/\/userserve-ak.last.fm\/serve\/34s\/32970217.jpg","size":"small"},{"#text":"http:\/\/userserve-ak.last.fm\/serve\/64s\/32970217.jpg","size":"medium"},{"#text":"http:\/\/userserve-ak.last.fm\/serve\/126\/32970217.jpg","size":"large"},{"#text":"http:\/\/userserve-ak.last.fm\/serve\/300x300\/32970217.jpg","size":"extralarge"}]}];

FakeData.AuthorisationError = "{ \"error\" : 13, \"message\" : \"Signature is invalid\" }";

FakeData.SuccessfulAuthorisation = "{ \"session\":  { \"name\": \"username\", \"key\": \"sessionkey\", \"subscriber\": \"0\"} }"; 

FakeData.UpdateError = "{ \"error\" : 13, \"message\" : \"Invalid method signature supplied\" }";

FakeData.UpdateNowPlayingSuccess = "{\"nowplaying\":{\"track\":{\"#text\":\"Run To Your Grave\",\"corrected\":\"0\"},\"artist\":{\"#text\":\"The Mai Shi\",\"corrected\":\"0\"},\"album\":{\"#text\":\"\",\"corrected\":\"0\"},\"albumArtist\":{\"#text\":\"\",\"corrected\":\"0\"},\"ignoredMessage\":{\"#text\":\"\",\"code\":\"0\"}}}";

FakeData.ScrobbleSuccess= "{\"scrobbles\":{\"scrobble\":{\"track\":{\"#text\":\"Run To Your Grave\",\"corrected\":\"0\"},\"artist\":{\"#text\":\"The Mai Shi\",\"corrected\":\"0\"},\"album\":{\"#text\":\"\",\"corrected\":\"0\"},\"albumArtist\":{\"#text\":\"\",\"corrected\":\"0\"},\"timestamp\":\"1287180538\",\"ignoredMessage\":{\"#text\":\"\",\"code\":\"0\"}},\"@attr\":{\"accepted\":\"1\",\"ignored\":\"0\"}}}";

FakeData.UserInfo = "{\"user\":{\"name\":\"jammus\",\"realname\":\"James\",\"image\":[{\"#text\":\"http:\/\/userserve-ak.last.fm\/serve\/34\/5208646.jpg\",\"size\":\"small\"},{\"#text\":\"http:\/\/userserve-ak.last.fm\/serve\/64\/5208646.jpg\",\"size\":\"medium\"},{\"#text\":\"http:\/\/userserve-ak.last.fm\/serve\/126\/5208646.jpg\",\"size\":\"large\"},{\"#text\":\"http:\/\/userserve-ak.last.fm\/serve\/252\/5208646.jpg\",\"size\":\"extralarge\"}],\"url\":\"http:\/\/www.last.fm\/user\/jammus\",\"id\":\"9421325\",\"country\":\"UK\",\"age\":\"29\",\"gender\":\"m\",\"subscriber\":\"0\",\"playcount\":\"4049\",\"playlists\":\"2\",\"bootstrap\":\"0\",\"registered\":{\"#text\":\"2008-02-14 14:14\",\"unixtime\":\"1202998466\"}}}";

FakeData.UnknownUser = "{\"error\":6,\"message\":\"No user with that name was found\"}";

FakeData.Error = "{\"error\":1,\"message\":\"Error received\"}";

FakeData.NotEnoughTrackInfo = "{\"error\":6,\"message\":\"You must supply either a track & artist name or a track mbid.\"}";

FakeData.RunToYourGraveTrackInfo = "{\"track\":{\"id\":\"87962768\",\"name\":\"Run To Your Grave\",\"mbid\":\"\",\"url\":\"http:\/\/www.last.fm\/music\/The+Mae+Shi\/_\/Run+To+Your+Grave\",\"duration\":\"232000\",\"streamable\":{\"#text\":\"1\",\"fulltrack\":\"0\"},\"listeners\":\"38019\",\"playcount\":\"164628\",\"artist\":{\"name\":\"The Mae Shi\",\"mbid\":\"8eb5c47c-4847-4c4b-a041-879d8fc5fbf3\",\"url\":\"http:\/\/www.last.fm\/music\/The+Mae+Shi\"},\"album\":{\"artist\":\"The Mae Shi\",\"title\":\"HILLYH\",\"mbid\":\"\",\"url\":\"http:\/\/www.last.fm\/music\/The+Mae+Shi\/HILLYH\",\"image\":[{\"#text\":\"http:\/\/userserve-ak.last.fm\/serve\/64s\/4656031.jpg\",\"size\":\"small\"},{\"#text\":\"http:\/\/userserve-ak.last.fm\/serve\/126\/4656031.jpg\",\"size\":\"medium\"},{\"#text\":\"http:\/\/userserve-ak.last.fm\/serve\/174s\/4656031.jpg\",\"size\":\"large\"},{\"#text\":\"http:\/\/userserve-ak.last.fm\/serve\/300x300\/4656031.jpg\",\"size\":\"extralarge\"}],\"@attr\":{\"position\":\"7\"}},\"toptags\":{\"tag\":[{\"name\":\"experimental\",\"url\":\"http:\/\/www.last.fm\/tag\/experimental\"},{\"name\":\"00s\",\"url\":\"http:\/\/www.last.fm\/tag\/00s\"},{\"name\":\"fuck yeah\",\"url\":\"http:\/\/www.last.fm\/tag\/fuck%20yeah\"},{\"name\":\"pop\",\"url\":\"http:\/\/www.last.fm\/tag\/pop\"},{\"name\":\"sing-a-long\",\"url\":\"http:\/\/www.last.fm\/tag\/sing-a-long\"}]}}}";

FakeData.UnexpectedRecentTracks = "{\"recenttracks\":\"somthing\"}";
