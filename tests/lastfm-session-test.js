require('./common.js');
var LastFmSession = require('lastfm/lastfm-session').LastFmSession;

function setupFixture(context) {
  context.lastfm = new LastFmNode();
  context.session = new LastFmSession(context.lastfm);
  context.expectError = function(errorMessage) {
    context.gently.expect(context.session, "emit", function(event, error) {
      assert.equal("error", event);
      assert.equal(errorMessage, error.message);
    });
  };

  context.whenReadRequestReturns = function(returndata) {
    context.gently.expect(context.lastfm, "readRequest", function(params, signed, callback) {
      callback(returndata);
    });
  };

  context.gently = new Gently();
};

describe("a new LastFmSession");
before(function() {
   this.session = new LastFmSession(new LastFmNode());
});

it("has no session key", function() {
  assert.ok(!this.session.key);
});

it("has no user", function() {
  assert.ok(!this.session.user);
});

it("can configure key and user", function() {
  var session = new LastFmSession(new LastFmNode(), "user", "sessionkey");
  assert.equal("user", session.user);
  assert.equal("sessionkey", session.key);
});

describe("a LastFmSession authorisation request")
before(function() {
   setupFixture(this);
});

it("emits error when no token supplied", function() {
  this.expectError("No token supplied");
  this.session.authorise(); 
});

it("contains supplied token", function() {
  this.gently.expect(this.lastfm, "readRequest", function(params) {
    assert.equal("token", params.token);
  });
  this.session.authorise("token");
});

it("uses getSession method", function() {
  this.gently.expect(this.lastfm, "readRequest", function(params) {
    assert.equal("auth.getsession", params.method);
  });
  this.session.authorise("token");
});

it("is signed", function() {
  this.gently.expect(this.lastfm, "readRequest", function(params, signed) {
    assert.ok(signed);
  });
  this.session.authorise("token");
});

describe("a completed LastFmSession authorisation request")
before(function() {
   setupFixture(this);
});

it("emits error when authorisation not successful", function() {
  this.whenReadRequestReturns(FakeData.AuthorisationError);
  this.expectError("Signature is invalid");
  this.session.authorise("token");
});

it("emits error when receiving unexpected return data", function() {
  this.whenReadRequestReturns(FakeData.SingleRecentTrack);
  this.expectError("Unexpected error");
  this.session.authorise("token");
});

it("emits authorised when successful", function() {
  this.whenReadRequestReturns(FakeData.SuccessfulAuthorisation);
  this.gently.expect(this.session, "emit", function(event) {
    assert.equal("authorised", event);
  });
  this.session.authorise("token");
});

it("can have error handler specified with authorise call", function() {
  var handler = { error: function(error) { } };
  this.gently.expect(handler, "error", function(error) {
    assert.equal("No token supplied", error.message); 
  });
  this.session.authorise("", {
    error: handler.error
  });
});

it("updates session key and user when successful", function() {
  this.whenReadRequestReturns(FakeData.SuccessfulAuthorisation);
  this.gently.expect(this.session, "emit", function(event, session) {
    assert.equal("username", session.user);
    assert.equal("sessionkey", session.key);
  });
  this.session.authorise("token");
});

it("can have authorised handler specified with authorise call", function() {
  var handler = { authorised: function(session) { } };
  this.whenReadRequestReturns(FakeData.SuccessfulAuthorisation);
  this.gently.expect(handler, "authorised", function(session) {
    assert.equal("username", session.user);
    assert.equal("sessionkey", session.key);
  });
  this.session.authorise("token", {
    authorised: handler.authorised
  });
});
