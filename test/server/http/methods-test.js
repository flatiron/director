/*
 * methods-test.js: Tests for HTTP methods. 
 *
 * (C) 2011, Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    sugarskull = require('../../../lib/sugarskull');
    
vows.describe('sugarskull/http/methods').addBatch({
  "When using sugarskull": {
    "an instance of sugarskull.http.Router should have all relevant RFC methods": function () {
      var router = new sugarskull.http.Router();
      sugarskull.http.methods.forEach(function (method) {
        assert.isFunction(router[method.toLowerCase()]);
      });
    }
  }
}).export(module);