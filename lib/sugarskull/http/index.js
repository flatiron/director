
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

Router.prototype.on = function (method, path) {
  var args = Array.prototype.slice.call(arguments, 2),
      route = args.pop(),
      options = args.pop();
  
  if (options && options.stream) {
    route.stream = true;
  }
  
  sugarskull.Router.prototype.on.call(this, method, path, route);
}

//
// ### function dispatch (method, path)
// #### @req {http.ServerRequest} Incoming request to dispatch.
// #### @res {http.ServerResponse} Outgoing response to dispatch.
// #### @callback {function} **Optional** Continuation to respond to for async scenarios. 
// Finds a set of functions on the traversal towards
// `method` and `path` in the core routing table then 
// invokes them based on settings in this instance.
//
Router.prototype.dispatch = function (req, res, callback) {
  var fns = this.traverse(req.method, req.url, this.routes, ''),
      runlist,
      stream;
  
  if (!fns || fns.length === 0) {
    if (typeof this.notfound === 'function') {
      this.notfound(callback);
    }

    return false;
  }
  
  if (this.recurse === 'forward') {
    fns = fns.reverse();
  }
  
  stream = fns.some(function (fn) { return fn.stream === true });
  runlist = this.runlist(fns);
  
  if (!stream) {
    //
    // TODO: If no streaming needs to take place by any entitity
    //       then just parse the body and await the call to `invoke` until the request
    //       has ended.
    //
  }

  this.invoke(runlist, { req: req, res: res }, callback);
  return true;
};
