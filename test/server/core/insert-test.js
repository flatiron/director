/*
 * insert-test.js: Tests for inserting routes into a normalized routing table. 
 *
 * (C) 2011, Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    sugarskull = require('../../../lib/sugarskull');
    
vows.describe('sugarskull/router/insert').addBatch({
  "An instance of sugarskull.Router": {
    topic: new sugarskull.Router(),
    "the insert() method": {
      "'on', ['foo', 'bar']": function (router) {
        function route () { }
        
        router.insert('on', ['foo', 'bar'], route);
        assert.strictEqual(router.routes.foo.bar.on, route);
      },
      "'on', ['foo', 'bar'] again": function (router) {
        function route () { }
        
        router.insert('on', ['foo', 'bar'], route);
        assert.isArray(router.routes.foo.bar.on);
        assert.length(router.routes.foo.bar.on, 2);
      },
      "'on', ['foo', 'bar'] a third time": function (router) {
        function route () { }
        
        router.insert('on', ['foo', 'bar'], route);
        assert.isArray(router.routes.foo.bar.on);
        assert.length(router.routes.foo.bar.on, 3);
      },
      "'get', ['fizz', 'buzz']": function (router) {
        function route () { }
        
        router.insert('get', ['fizz', 'buzz'], route);
        assert.strictEqual(router.routes.fizz.buzz.get, route);        
      }
    }
  }
}).export(module);