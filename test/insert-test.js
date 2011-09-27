

var assert = require('assert'),
    vows = require('vows'),
    director = require('../lib/director');
    
vows.describe('director/router/insert').addBatch({
  "An instance of director.Router": {
    topic: new director.Router(),
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
      },
      "'get', ['fizz', 'buzz']": function (router) {
        function route () { }
        
        router.insert('get', ['fizz', 'buzz'], route);
        assert.strictEqual(router.routes.fizz.buzz.get, route);        
      }
    }
  }
}).export(module);