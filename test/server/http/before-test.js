/*
 * before-test.js: Tests for running before methods on HTTP server(s).
 *
 * (C) 2011, Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var assert = require('assert'),
    http = require('http'),
    vows = require('vows'),
    request = require('request'),
    director = require('../../../lib/director'),
    helpers = require('../helpers'),
    handlers = helpers.handlers,
    macros = helpers.macros;

function assertBark(uri) {
  return macros.assertGet(
    9090,
    uri,
    'hello from (bark)'
  );
}

vows.describe('director/http').addBatch({
  "An instance of director.http.Router": {
    "instantiated with a Routing table": {
      topic: function () {
        var router = new director.http.Router();
        
        console.dir(router.before);
        router.before('/hello', function () {
          console.log('hello');
        });
        
        router.get('/hello', handlers.respondWithId);
        
        console.dir(router);
        return router;
      },
      "should have the correct routes defined": function (router) {
        assert.isObject(router.routes.hello);
        assert.isFunction(router.routes.hello.before);
        assert.isFunction(router.routes.hello.get);
      }
    }
  }
}).export(module);