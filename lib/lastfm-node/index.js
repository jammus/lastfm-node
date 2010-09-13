var LastFmNode = exports.LastFmNode = function(options){
  if (!options) options = {};
  this.api_key = options.api_key;
  this.user = options.user;
  this.url = '/2.0';
};

LastFmNode.prototype.buildParams = function() {
  function addParam(key, value) {
    if(params != '') { params += '&'; }
    params += key + '=' + value;
  }

  var params = '';
  addParam('method', 'user.getrecenttracks');
  addParam('api_key', this.api_key);
  addParam('user', this.user);
  addParam('format', 'json');
  return params;
};

LastFmNode.prototype.requestUrl = function() {
  return this.url;
};
