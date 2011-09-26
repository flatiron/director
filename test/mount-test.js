
var assert = require('assert'),
    vows = require('vows'),
    eyes = require('eyes'),
    director = require('../lib/director');
    
vows.describe('director/router/mount').addBatch({
  "An instance of director.Router": {
    topic: new director.Router(),
    "the mount() method": {
      "should sanitize the routes correctly": function (router) {
        function foobar () { }
        function foostar () { }
        function foobazzbuzz () { }
      
        router.mount({
          '/foo': {
            '/bar': foobar,
            '/*': foostar
          },
          '/foo/bazz': {
            '/buzz': foobazzbuzz
          }
        });

        eyes.inspect(router.routes);
        assert.strictEqual(router.routes.foo.bar, foobar);
        assert.strictEqual(router.routes.foo['([_.()!\\ %@&a-zA-Z0-9-]+)'], foostar);
        
        assert.isObject(router.routes.foo.bazz);
        assert.strictEqual(router.routes.foo.bazz.buzz, foobazzbuzz);
      }
    }
  }
}).export(module);
