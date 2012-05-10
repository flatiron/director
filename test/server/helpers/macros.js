/*
 * macros.js: Test macros for director tests. 
 *
 * (C) 2011, Nodejitsu Inc.
 * MIT LICENSE
 *
 */
 
var assert = require('assert'),
    request = require('request');

exports.assertGet = function(port, uri, expected) {
  var context = {
    topic: function () {
      request({ uri: 'http://localhost:' + port + '/' + uri }, this.callback);
    }
  };
    
  context['should respond with `' + expected + '`'] = function (err, res, body) {
    assert.isNull(err);
    assert.equal(res.statusCode, 200);
    assert.equal(body, expected);
  };
  
  return context;
};

exports.assertPost = function(port, uri, expected) {
  return {
    topic: function () {
      request({ 
        method: 'POST',
        uri: 'http://localhost:' + port + '/' + uri,
        body: JSON.stringify(expected)
      }, this.callback);
    },
    "should respond with the POST body": function (err, res, body) {
      assert.isNull(err);
      assert.equal(res.statusCode, 200);
      assert.deepEqual(JSON.parse(body), expected);
    }
  };
};
