var path = require("path");
global.Gently = require("gently");
global.GENTLY_HIJACK = new Gently();
global.LastFmNode = require("../lib/lastfm").LastFmNode;
global.FakeData = require("./TestData.js").FakeData;
global.FakeTracks = require("./TestData.js").FakeTracks;
if (process.setMaxListeners) {
    process.setMaxListeners(900);
}
global.emptyFn = function() { };
