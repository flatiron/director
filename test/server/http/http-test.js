/*
 * http-test.js: Tests for basic HTTP server(s). 
 *
 * (C) 2011, Nodejitsu Inc.
 * MIT LICENSE
 *
 */
 
var assert = require('assert'),
    http = require('http'),
    vows = require('vows'),
    request = require('request'),
    director = require('../../../lib/director');

function helloWorld(id) {
  this.res.writeHead(200, { 'Content-Type': 'text/plain' })
  this.res.end('hello from (' + id + ')');
}

function createServer (router) {
  return http.createServer(function (req, res) {
    router.dispatch(req, res, function (err) {
      if (err) {
        res.writeHead(404);
        res.end();
      }
    });
  });
}

function assertGet (uri) {
  return {
    topic: function () {
      request({ uri: 'http://localhost:9090/' + uri }, this.callback);
    },
    "should respond with `hello from (bark)`": function (err, res, body) {
      assert.isNull(err);
      assert.equal(res.statusCode, 200);
      assert.equal(body, 'hello from (bark)')
    }
  }
}

vows.describe('director/server/http').addBatch({
  "An instance of director.http.Router": {
    "instantiated with a Routing table": {
      topic: new director.http.Router({
        '/hello': {
          get: helloWorld
        }
      }),
      "should have the correct routes defined": function (router) {
        assert.isObject(router.routes.hello);
        assert.isFunction(router.routes.hello.get);
      },
      "when passed to an http.Server instance": {
        topic: function (router) {
          router.get(/foo\/bar\/(\w+)/, helloWorld);
          router.get(/foo\/update\/(\w+)/, helloWorld);
          router.path(/bar\/bazz\//, function () {
            this.get(/(\w+)/, helloWorld)
          });
          
          var server = createServer(router),
              that = this;
              
          server.listen(9090, this.callback);
        },
        "a request to foo/bar/bark": assertGet('foo/bar/bark'),
        "a request to foo/update/bark": assertGet('foo/update/bark'),
        "a request to bar/bazz/bark": assertGet('bar/bazz/bark')
      }
    }
  }
}).export(module);