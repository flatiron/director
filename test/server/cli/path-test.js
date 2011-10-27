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
    
vows.describe('sugarskull/cli/path').addBatch({
  "An instance of sugarskull.cli.Router": {
    topic: new sugarskull.cli.Router(),
    "the path() method": {
      "should create the correct nested routing table": function (router) {
        function noop () {}
        
        router.path(/apps/, function () {
          router.path(/foo/, function () {
            router.on(/bar/, noop);
          });
          
          router.on(/list/, noop);
        });
        
        router.on(/users/, noop);
        
        assert.isObject(router.routes.apps);
        assert.isFunction(router.routes.apps.list.on);
        assert.isObject(router.routes.apps.foo);
        assert.isFunction(router.routes.apps.foo.bar.on);
        assert.isFunction(router.routes.users.on);
      }
    }
  }
}).export(module);