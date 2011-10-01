
var util = require('util'),
    sugarskull = require('../../sugarskull');

//
// ### Expose all HTTP methods and responses
//
exports.methods   = require('./methods');
exports.responses = require('./responses');

var Router = exports.Router = function (routes) {
  
};

//
// Inherit from `sugarskull.Router`.
//
util.inherits(Router, sugarskull.Router);

//
// ### Extend the `Router` prototype with all of the RFC methods.
//
Router.prototype.extend.call(Router.prototype, exports.methods);

//
// ### function dispatch (method, path)
// #### @method {string} Method to dispatch
// #### @path {string} Path to dispatch
// #### @routes {Object} **Optional** Current route context in which to dispatch
// #### @fns {Array} **Optional** Call list to evaluate when complete.
// #### @regexp {string} **Optional** String representation of the regexp of the current context.
// Core routing logic for `sugarskull.Router`: traverses the
// specified `path` within the `routes` adding relevant functions
// to the `fns` call list. At the end, it evaluates all of them
// in the `this` context of the function.
//
// Algorithm:
//
// 1. 
//
Router.prototype.dispatch = function (method, path, req, res) {
  var thisArg = {
    req: req,
    res: res
  };
  
  return dispatch.call(thisArg, method, path, this.routes, '', this);
};
