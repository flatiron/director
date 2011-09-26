

var assert = require('assert'),
    vows = require('vows'),
    director = require('../lib/director');
    
vows.describe('director/router/mount').addBatch({
  "An instance of director.Router": {
    topic: new director.Router(),
    "the mount() method": {
      "should sanitize the routes correctly": function (router) {
        function foobar () { }
        function foostar () { }
      
        router.mount({
          '/foo': {
            '/bar': foobar,
            '/*': foostar
          }
        });
      
        assert.strictEqual(router.routes.foo.bar, foobar);
        assert.strictEqual(router.routes.foo['([_.()!\\ %@&a-zA-Z0-9-]+)'], foostar);
      }
    }
  }
}).export(module);