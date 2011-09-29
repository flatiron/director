

var assert = require('assert'),
    vows = require('vows'),
    SS = require('../lib/SS');
    
vows.describe('SS/router').addBatch({
  "When using SS": {
    "Router.prototype should have all relevant RFC methods": function () {
      SS.methods.forEach(function (method) {
        assert.isFunction(SS.Router.prototype[method.toLowerCase()]);
      });
    }
  }
}).export(module);