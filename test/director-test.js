

var assert = require('assert'),
    vows = require('vows'),
    director = require('../lib/director');
    
vows.describe('director/router').addBatch({
  "When using director": {
    "Router.prototype should have all relevant RFC methods": function () {
      director.methods.forEach(function (method) {
        assert.isFunction(director.Router.prototype[method.toLowerCase()]);
      });
    }
  }
}).export(module);