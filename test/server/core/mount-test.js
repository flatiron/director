
var assert = require('assert'),
    vows = require('vows'),
    eyes = require('eyes'),
    sugarskull = require('../../../lib/sugarskull');

function assertRoute (fn, path, route) {
  if (path.length === 1) {
    return assert.strictEqual(route[path.shift()], fn);
  }

  route = route[path.shift()];
  assert.isObject(route);
  assertRoute(fn, path, route);
}

vows.describe('sugarskull/router/mount').addBatch({
  "An instance of sugarskull.Router": {
    "with no preconfigured params": {
      topic: new sugarskull.Router(),
      "the mount() method": {
        "should sanitize the routes correctly": function (router) {
          function foobar () { }
          function foostar () { }
          function foobazzbuzz () { }
          function foodog () { }
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
            '/foo/jitsu/then/now': foostar,
            '/foo/:dog': foodog
          });

          assertRoute(foobar,      [ 'foo', 'bar', 'on'],                       router.routes);
          assertRoute(foostar,     ['foo', '([_.()!\\ %@&a-zA-Z0-9-]+)', 'on'], router.routes);
          assertRoute(fnArray,     ['foo', 'jitsu', 'then', 'on'],              router.routes);
          assertRoute(foobar,      ['foo', 'jitsu', 'then', 'before'],          router.routes);
          assertRoute(foobazzbuzz, ['foo', 'bazz', 'buzz', 'on'],               router.routes);
          assertRoute(foostar,     ['foo', 'jitsu', 'then', 'now', 'on'],       router.routes);
          assertRoute(foodog,      ['foo', '([a-zA-Z0-9-]+)', 'on'],            router.routes);
        }
      }
    },
    "with preconfigured params": {
      topic: function () {
        var router = new sugarskull.Router();
        router.param('city', '([\\w\\-]+)');
        router.param(':country', /([A-Z][A-Za-z]+)/);
        router.param(':zip', /([\d]{5})/);
        return router;
      },
      "should sanitize the routes correctly": function (router) {
        function usaCityZip () { }
        function countryCityZip () { }
        
        router.mount({
          '/usa/:city/:zip': usaCityZip,
          '/world': {
            '/:country': {
              '/:city/:zip': countryCityZip
            }
          }
        });
        
        assertRoute(usaCityZip, ['usa', '([\\w\\-]+)', '([\\d]{5})', 'on'], router.routes);
        assertRoute(countryCityZip, ['world', '([A-Z][A-Za-z]+)', '([\\w\\-]+)', '([\\d]{5})', 'on'], router.routes);
      }
    }
  }
}).export(module);
