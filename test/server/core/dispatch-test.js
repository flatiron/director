/*
 * dispatch-test.js: Tests for the core dispatch method. 
 *
 * (C) 2011, Nodejitsu Inc.
 * MIT LICENSE
 *
 */
 
var assert = require('assert'),
    vows = require('vows'),
    eyes = require('eyes'),
    sugarskull = require('../../../lib/sugarskull');
    
vows.describe('sugarskull/router/dispatch').addBatch({
  "An instance of sugarskull.Router": {
    topic: function () {
      var that = this;
      that.matched = {};
      that.matched['foo'] = [];
      that.matched['f*'] = []
      
      return new sugarskull.Router({
        '/foo': {
          before: function () { that.matched.foo.push('before foo') },
          on: function () { that.matched.foo.push('on foo') },
          after: function () { that.matched.foo.push('after foo') },
          '/bar': {
            before: function () { that.matched.foo.push('before foo bar') },
            on: function () { that.matched.foo.push('foo bar') },
            after: function () { that.matched.foo.push('after foo bar') },
            '/buzz': function () { that.matched.foo.push('foo bar buzz') }
          }
        },
        '/f*': {
          '/barbie': function () { that.matched['f*'].push('f* barbie') }
        }
      })
    },
    "should have the correct routing table": function (router) {
      assert.isObject(router.routes.foo);
      assert.isObject(router.routes.foo.bar);
      assert.isObject(router.routes.foo.bar.buzz);
      assert.isFunction(router.routes.foo.bar.buzz.on);
    },
    "the dispatch() method": {
      "/foo/bar/buzz": function (router) {
        assert.isTrue(router.dispatch('on', '/foo/bar/buzz'));
        assert.equal(this.matched.foo[0], 'before foo');
        assert.equal(this.matched.foo[1], 'on foo');
        assert.equal(this.matched.foo[2], 'before foo bar');
        assert.equal(this.matched.foo[3], 'foo bar');
        assert.equal(this.matched.foo[4], 'foo bar buzz');
        assert.equal(this.matched.foo[5], 'after foo bar');
        assert.equal(this.matched.foo[6], 'after foo');
      },
      "/foo/barbie": function (router) {
        assert.isTrue(router.dispatch('on', '/foo/barbie'));
        assert.equal(this.matched['f*'][0], 'f* barbie');
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
