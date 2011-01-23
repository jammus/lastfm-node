require('./common.js');
var LastFmSession = require('lastfm/lastfm-session');
var fakes = require("./fakes");

function setupFixture(context) {
  context.errorMessage = "";
  context.token = "";
  context.returndata = null;
  context.options = null;
  context.request = new fakes.LastFmRequest();
  context.lastfm = new LastFmNode();
  context.session = new LastFmSession(context.lastfm);
  context.expectError = function(errorMessage) {
    context.gently.expect(context.session, "emit", function(event, error) {
      assert.equal("error", event);
      assert.equal(errorMessage, error.message);
    });
    context.session.authorise(context.token, context.options);
    if (context.errorMessage) {
      context.request.emit("error", new Error(context.errorMessage));
    }
    else {
      context.request.emit("success", context.returndata);
    }
  };

  context.expectAuthorisation = function(assertions) {
    context.gently.expect(context.session, "emit", function(event, session) {
      assert.equal("authorised", event);
      if (assertions) {
        assertions(session);
      }
    });
    context.session.authorise(context.token, context.options);
    context.request.emit("success", context.returndata);
  }

  context.whenReadRequestReturns = function(returndata) {
    context.returndata = returndata;
    context.gently.expect(context.lastfm, "read", function(params, signed) {
      return context.request;
    });
  };

  context.whenReadRequestThrowsError = function(errorMessage) {
    context.errorMessage = errorMessage;
    context.gently.expect(context.lastfm, "read", function(params, signed) {
      return context.request;
    });
  };
  
  context.andTokenIs = function(token) {
    context.token = token;
  };

  context.andOptionsAre = function(options) {
    context.options = options;
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

it("is not authorised", function() {
  assert.ok(!this.session.isAuthorised());
});

it("can configure key and user", function() {
  var session = new LastFmSession(new LastFmNode(), "user", "sessionkey");
  assert.equal("user", session.user);
  assert.equal("sessionkey", session.key);
});

it("is authorised when it has a key", function() {
  var session = new LastFmSession(new LastFmNode(), "user", "sessionkey");
  assert.ok(session.isAuthorised());
});

describe("a LastFmSession authorisation request")
before(function() {
   setupFixture(this);
});

it("emits error when no token supplied", function() {
  this.expectError("No token supplied");
});

it("contains supplied token", function() {
  var that = this;
  this.gently.expect(this.lastfm, "read", function(params) {
    assert.equal("token", params.token);
    return that.request;
  });
  this.session.authorise("token");
});

it("uses getSession method", function() {
  var that = this;
  this.gently.expect(this.lastfm, "read", function(params) {
    assert.equal("auth.getsession", params.method);
    return that.request;
  });
  this.session.authorise("token");
});

it("is signed", function() {
  var that = this;
  this.gently.expect(this.lastfm, "read", function(params, signed) {
    assert.ok(signed);
    return that.request;
  });
  this.session.authorise("token");
});

describe("a completed LastFmSession authorisation request")
before(function() {
   setupFixture(this);
});

it("emits error when authorisation not successful", function() {
  this.whenReadRequestReturns(FakeData.AuthorisationError);
  this.andTokenIs("token");
  this.expectError("Signature is invalid");
});

it("emits error when receiving unexpected return data", function() {
  this.whenReadRequestReturns(FakeData.SingleRecentTrack);
  this.andTokenIs("token");
  this.expectError("Unexpected error");
});

it("emits authorised when successful", function() {
  this.whenReadRequestReturns(FakeData.SuccessfulAuthorisation);
  this.andTokenIs("token");
  this.expectAuthorisation();
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
  this.andTokenIs("token");
  this.expectAuthorisation(function(session) {
    assert.equal("username", session.user);
    assert.equal("sessionkey", session.key);
    assert.ok(session.isAuthorised());
  });
});

it("can have authorised handler specified with authorise call", function() {
  var handler = { authorised: function(session) { } };
  this.whenReadRequestReturns(FakeData.SuccessfulAuthorisation);
  this.session.authorise("token", {
    authorised: handler.authorised
  });
});

it("bubbles up errors", function() {
  var errorMessage = "Bubbled error";
  this.whenReadRequestThrowsError(errorMessage);
  this.andTokenIs("token");
  this.expectError(errorMessage);
});
