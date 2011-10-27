/*
 * path-test.js: Tests for the core dispatch method. 
 *
 * (C) 2011, Nodejitsu Inc.
 * MIT LICENSE
 *
 */
 
var assert = require('assert'),
    vows = require('vows'),
    eyes = require('eyes'),
    sugarskull = require('../../../lib/sugarskull');
    
vows.describe('sugarskull/router/path').addBatch({
  "An instance of sugarskull.Router": {
    topic: function () {
      var that = this;
      that.matched = {};
      that.matched['newyork'] = [];
      
      var router = new sugarskull.Router({
        '/foo': function () { that.matched.foo.push('foo'); }
      });

      return router;
    },
    "should have the correct context": function (router) {
      var that = this;
      
      router.filter = ['POST', 'DELETE']; // global filters.

      //
      // there is no `.path()` only `.on`, `.get`, `.post`, `.head`, `.put`, `.delete` etc.
      //
      router.on('/regions', function () {

        this.accept = ['POST', 'GET', 'DELETE'];
        this.filter = ['POST', 'DELETE']; // scoped filters (catches `verb-as-method` and `on`).

        this.on('/:state', function(country) {
          that.matched.foo.push('before foo')
        });

      });
    },
    "the dispatch() method": {
      "/regions/newyork": function (router) {
        router.dispatch('on', '/regions');
        console.log(this.matched);
      }
    }
  }
}).export(module);
