
var events = require('events'),
    util = require('util'),
    sugarskull = require('../../sugarskull');

//
// ### Expose all HTTP methods and responses
//
exports.methods   = require('./methods');
exports.responses = require('./responses');

var Router = exports.Router = function (routes) {
  sugarskull.Router.call(this, routes);
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
// #### @req {http.ServerRequest} Incoming request to dispatch.
// #### @res {http.ServerResponse} Outgoing response to dispatch.
// Finds a set of functions on the traversal towards
// `method` and `path` in the core routing table then 
// invokes them based on settings in this instance.
//
Router.prototype.dispatch = function (method, path, req, res) {
  var fns = this.traverse(method, path, this.routes, ''),
      thisArg = new events.EventEmitter();
  
  thisArg.req = req;
  thisArg.res = res;
  
  if (!fns) {
    return false;
  }
  
  this.invoke(fns, thisArg);
  return true;
};
