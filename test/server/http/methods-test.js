/*
 * methods-test.js: Tests for HTTP methods. 
 *
 * (C) 2011, Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    director = require('../../../lib/director');
    
vows.describe('director/http/methods').addBatch({
  "When using director": {
    "an instance of director.http.Router should have all relevant RFC methods": function () {
      var router = new director.http.Router();
      director.http.methods.forEach(function (method) {
        assert.isFunction(router[method.toLowerCase()]);
      });
    }
  }
}).export(module);