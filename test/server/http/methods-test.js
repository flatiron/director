

var assert = require('assert'),
    vows = require('vows'),
    sugarskull = require('../../../lib/sugarskull');
    
vows.describe('sugarskull/http/methods').addBatch({
  "When using sugarskull": {
    "Router.prototype should have all relevant RFC methods": function () {
      sugarskull.http.methods.forEach(function (method) {
        assert.isFunction(sugarskull.http.Router.prototype[method.toLowerCase()]);
      });
    }
  }
}).export(module);