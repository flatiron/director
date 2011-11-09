
var events = require('events'),
    qs = require('querystring'),
    util = require('util'),
    sugarskull = require('../../sugarskull');

//
// ### Expose all HTTP methods and responses
//
exports.methods   = require('./methods');
exports.responses = require('./responses');

var Router = exports.Router = function (routes) {
  sugarskull.Router.call(this, routes);
  
  //
  // ### Extend the `Router` prototype with all of the RFC methods.
  //
  this.extend(exports.methods);
};

//
// Inherit from `sugarskull.Router`.
//
util.inherits(Router, sugarskull.Router);

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
  //
  // Dispatch `HEAD` requests to `GET`
  //  
  var method = req.method === 'HEAD' ? 'get' : req.method.toLowerCase(),
      fns = this.traverse(method, req.url, this.routes, ''),
      self = this,
      runlist,
      stream;
  
  if (!fns || fns.length === 0) {
    if (callback) {
      callback(new Error('Could not find path: ' + req.url));
    }
    return false;
  }
  
  if (this.recurse === 'forward') {
    fns = fns.reverse();
  }
  
  stream = fns.some(function (fn) { return fn.stream === true });
  runlist = this.runlist(fns);
  
  function parseAndInvoke() {
    self.parse(req);
    self.invoke(runlist, { req: req, res: res }, callback);
  }
  
  if (!stream) {
    //
    // If there is no streaming required on any of the functions on the 
    // way to `path`, then attempt to parse the fully buffered request stream
    // once it has emitted the `end` event.
    //
    if (req.readable) {
      //
      // If the `http.ServerRequest` is still readable, then await
      // the end event and then continue 
      //
      req.once('end', parseAndInvoke)
    }
    else {
      //
      // Otherwise, just parse the body now. 
      //
      parseAndInvoke();
    }
  }
  else {
    this.invoke(runlist, { req: req, res: res }, callback);
  }

  return true;
};

Router.prototype.parsers = {
  'application/x-www-form-urlencoded': qs.parse,
  'application/json': JSON.parse
};

Router.prototype.parse = function (req) {
  function mime(req) {
    var str = req.headers['content-type'] || '';
    return str.split(';')[0];
  }
  
  var parser = this.parsers[mime(req)],
      body;
      
  if (parser) {
    req.body = '';
    req.chunks.forEach(function (chunk) {
      req.body += chunk;
    });
    
    try {
      req.body = req.body
        ? parser(data)
        : {};
    } 
    catch (err) {
      //
      // Remark: We should probably do something here.
      //
    }
  }
};

