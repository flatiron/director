
var assert = require('assert'),
    vows = require('vows'),
    eyes = require('eyes'),
    director = require('../lib/director');
    
vows.describe('director/router/mount').addBatch({
  "An instance of director.Router": {
    topic: new director.Router({
      '/foo': {
        before: function () { console.log('before foo') },
        on: function log () { console.log('foo') },
        '/bar': {
          before: function () { console.log('before foo bar') },
          on: function log () { console.log('foo bar') },
          '/buzz': function log () { console.log('foo bar buzz') }
        }
      },
      '/f*': {
        '/barbie': function log () { console.log ('f* barbie') }
      }
    }),
    "should have the correct routing table": function (router) {
      assert.isObject(router.routes.foo);
      assert.isObject(router.routes.foo.bar);
      assert.isObject(router.routes.foo.bar.buzz);
      assert.isFunction(router.routes.foo.bar.buzz.on);
    },
    "the dispatch() method": {
      "/foo/bar/buzz": function (router) {
        assert.isTrue(router.dispatch('on', '/foo/bar/buzz'));
      },
      "/foo/BAD": function (router) {
        assert.isFalse(router.dispatch('on', '/foo/BAD'));
      },
      "/bar/bar": function (router) {
        assert.isFalse(router.dispatch('on', '/bar/bar'));
      }
    }
  }
}).export(module);
