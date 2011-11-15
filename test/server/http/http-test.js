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
    director = require('../../../lib/director');

function helloWorld(route) {
  this.res.writeHead(200, { 'Content-Type': 'text/plain' })
  this.res.end('hello world from (' + route + ')');
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
      }
    }
  }
}).export(module);