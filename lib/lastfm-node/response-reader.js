exports.ResponseReader = function(request, callback) {
  request.on('response', function(response) {
    var data = '';
    response.on('data', function(chunk) { data += chunk.toString('utf8'); });
    response.on('end', function() {
      callback(data); 
    });
    response.on('error', function(error) {
      callback(null, error)
    });
  });
  request.on('error', function(error) {
    callback(null, error);
  });
};
