
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
        var fnArray = [foobar, foostar];
      
        router.mount({
          '/foo': {
            '/bar': foobar,
            '/*': foostar,
            '/jitsu/then': {
              before: foobar
            }
          },
          '/foo/bazz': {
            '/buzz': foobazzbuzz
          },
          '/foo/jitsu': {
            '/then': fnArray
          },
          '/foo/jitsu/then/now': foostar
        });

        eyes.inspect(router.routes);
        assert.strictEqual(router.routes.foo.bar.on, foobar);
        assert.strictEqual(router.routes.foo['([_.()!\\ %@&a-zA-Z0-9-]+)'].on, foostar);
        assert.strictEqual(router.routes.foo.jitsu.then.on, fnArray);
        assert.strictEqual(router.routes.foo.jitsu.then.before, foobar);
        
        assert.isObject(router.routes.foo.bazz);
        assert.strictEqual(router.routes.foo.bazz.buzz.on, foobazzbuzz);
        assert.strictEqual(router.routes.foo.jitsu.then.now.on, foostar);
      }
    }
  }
}).export(module);
