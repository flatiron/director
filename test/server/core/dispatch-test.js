
var assert = require('assert'),
    vows = require('vows'),
    eyes = require('eyes'),
    sugarskull = require('../../../lib/sugarskull');
    
vows.describe('sugarskull/router/mount').addBatch({
  "An instance of sugarskull.Router": {
    topic: new sugarskull.Router({
      '/foo': {
        before: function beforeFoo () { console.log('before foo') },
        on: function onFoo () { console.log('foo') },
        after: function afterFoo () { console.log('after foo') },
        '/bar': {
          before: function beforeFooBar () { console.log('before foo bar') },
          on: function onFooBar () { console.log('foo bar') },
          after: function afterFooBar () { console.log ('after foo bar') },
          '/buzz': function onFooBarBuzz () { console.log('foo bar buzz') }
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
      "/foo/barbie": function (router) {
        assert.isTrue(router.dispatch('on', '/foo/barbie'));
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
