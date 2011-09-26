/*
 * router.js: Base functionality for the director router. 
 *
 * (C) 2011, Nodejitsu Inc.
 * MIT LICENSE
 *
 */

//
// Helper function for expanding wildcards (*) and 
// "named" matches (:whatever)
// 
function regifyString(str) {
  if (~str.indexOf('*')) {
    str = str.replace(/\*/g, '([_\.\(\)!\\ %@&a-zA-Z0-9-]+)');
  }
  
  if (~str.indexOf(':')) {
    str = str.replace(/:.*?\/|:.*?$/g, '([a-zA-Z0-9-]+)/');
    str = str.slice(0, -1);
  }
  
  return str;
}

//
// ### function Router (routes)
// #### @routes {Object} **Optional** Routing table for this instance.
// Constuctor function for the Router object responsible for building 
// and dispatching from a given routing table.
//
var Router = exports.Router = function (routes) {
  if (!(this instanceof Router)) return new Router(routes);
  
  this.configure();
  this.mount(routes || {});
};

//
// ### function configure (options)
// #### @options {Object} **Optional** Options to configure this instance with
// Configures this instance with the specified `options`.
//
Router.prototype.configure = function (options) {
  options = options || {};
  
  //
  // TODO: Use other existing configuration options
  //
  this.delimiter = options.delimiter || '\/';
};

//
// ### function on (method, path, route)
// #### @method {string} **Optional** Method to use 
// #### @path {string} Path to set this route on.
// #### @route {Array|function} Handler for the specified method and path.
// Adds a new `route` to this instance for the specified `method`
// and `path`.
//
Router.prototype.on = function (method, path, route) {
  if (!route && typeof path == 'function') {
    //
    // If only two arguments are supplied then assume this
    // `route` was meant to be a generic `on`. 
    //
    route = path;
    path = method;
    method = 'on';
  }
  
  this.insert(method, path.split(this.delimiter), route);
};

//
// ### function extend (methods)
// #### @methods {Array} List of method names to extend this instance with
// Extends this instance with simple helper methods to `this.on` 
// for each of the specified `methods` 
//
Router.prototype.extend = function (methods) {
  var self = this,
      len = methods.length,
      i;
  
  for (i = 0; i < len; i++) {
    (function (method) {
      self[method] = function (path, route) {
        self.on(method, path, route);
      };
      
    })(methods[i]);
  }
};

//
// ### function insert (method, path, route, context)
// #### @method {string} Method to insert the specific `route`.
// #### @path {Array} Parsed path to insert the `route` at.
// #### @route {Array|function} Route handlers to insert.
// #### @context {Object} **Optional** Context to insert into
// Inserts the `route` for the `method` into the routing table for 
// this instance at the specified `path` within the `context` provided.
// If no context is provided then `this.routes` will be used.
//
Router.prototype.insert = function (method, path, route, context) {
  var part = path.shift(),
      contextType,
      isArray,
      nested;
  
  context  = context || this.routes;
  
  if (path.length > 0) {
    //
    // If this is not the last part left in the `path`
    // (e.g. `['cities', 'new-york']`) then recurse into that 
    // context 
    //
    context[part] = context[part] || {};
    return this.insert(method, path, route, context[part]);
  }
  
  //
  // Otherwise, we are at the end of our insertion so we should
  // insert the `route` based on the `method` after getting the
  // `context` of the last `part`.
  //
  // Remark (indexzero): Need browser-compatible implementation of `Array.isArray`.
  //
  contextType = typeof context[part];
  isArray = Array.isArray(context[part]);
  
  if (context[part] && !isArray && contextType == 'object') {
    return context[part][method] = route;
  }
  else if (contextType == 'undefined') {
    if (method !== 'on') {
      nested = {};
      nested[method] = route;
      context[part] = nested;
    }
    else {
      context[part] = route;
    }
    
    return;
  }
  else if (isArray || contextType == 'function') {
    if (method !== 'on') {
      nested = { on: context[part] };
      nested[method] = route;
      context[part] = nested;
    }
    else {
      context[part] = isArray ? context[part].concat(route) : [context[part], route];
    }
    
    return;
  }
  
  throw new Error('Invalid route context: ' + contextType);
};

//
// ### function mount (routes, context) 
// #### @routes {Object} Routes to mount onto this instance
// Mounts the sanitized `routes` onto the root context for this instance.
//
// e.g.
// 
//    new Router().mount({ '/foo': { '/bar': function foobar() {} } })
// 
// yields
//
//    { 'foo': 'bar': function foobar() {} } }
//
Router.prototype.mount = function (routes) {
  if (!routes || typeof routes !== 'object' || Array.isArray(routes)) {
    return;
  }
  
  for (var route in routes) {
    this.mount(routes[route]);
    
    var rename = route;
    if (route[0] === this.delimiter) {
      rename = route.slice(1); 
    }
    
    if (/\:|\*/.test(rename)) {
      rename = regifyString(rename);
    }
    
    routes[rename] = routes[route];
    delete routes[route];
  }
  
  this.routes = routes;
};