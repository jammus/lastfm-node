var LastFmRequest = exports.LastFmRequest = function(connection, url, body) {
  var that = this;
  var method = body ? "POST" : "GET";

  connection.on("error", function(error) {
    that.emit("error", error);
  });

  var request = connection.request(method, url, getHeaders());
  if (body) {
    request.write(body);
  }
  request.on("response", handleResponse);
  request.end();

  function getHeaders() {
    var headers = {
      host: connection.host
    };

    if (body) {
      headers["Content-Length"] = body.length;
      headers["Content-Type"] = "application/x-www-form-urlencoded";
    }

    return headers;
  }

  function handleResponse(response) {
    var data = "";
    response.on("data", function(chunk) {
        data += chunk.toString("utf8");
    });
    response.on("end", function() {
      that.emit("success", data);
    });
  }
};
