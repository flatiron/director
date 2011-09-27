/*
 * router.js: Base functionality for the director router. 
 *
 * (C) 2011, Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var eyes = require('eyes');

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

function dispatch (method, path, routes, regexp, inst) {
  var fns = [],
      current,
      exact,
      next,
      that;
      
  for (var r in routes) {
    //
    // We dont have an exact match, lets explore.
    // e.g. r: `foo`,  path: `/foo/bar/buzz`
    //
    //    'foo': {
    //      'bar': {
    //        'buzz': { on: function() {} } 
    //      }
    //    } 
    //
    if (routes.hasOwnProperty(r) && !inst._methods[r]) {
      //
      // current: '' + '/' + 'foo' = '/foo'
      // exact:  ['/foo']
      //
      current = regexp + inst.delimiter + r;
      exact   = path.match(new RegExp('^' + current));
      
      //
      // If we are at the toplevel (e.g. `/`) and there is a more
      // liberal route available then do not continue
      // evaluation of this branch of the routing table.
      //
      if (exact && exact[0] === '/' 
        && '([a-zA-Z0-9-]+)' in routes) {
        continue;
      }
      
      if (!exact) {
        //
        // If there isn't an exact or approximate match
        // then continue
        //
        // Remark: Should we hit this case if **either** is null?
        //
        continue;
      }
      
      if (exact[0] && exact[0] == path && routes[r][method]) {
        //
        // If we had an `exact` match and the capture is 
        // the path itself, then we have completed our recursion.
        //
        next = [routes[r][method], routes[r].after].filter(Boolean);
        next.matched = true;
        return next;
      }
      
      next = dispatch.call(this, method, path, routes[r], current, inst);
      
      if (next.matched) {
        fns = fns.concat(
          [routes[r].before, routes[r].on].filter(Boolean),
          next, 
          [routes[r].after].filter(Boolean)
        );
        
        fns.matched = true;
        
        if (routes !== inst.routes) {
          return fns;
        }
        
        break;
      }
    }
  }
  
  if (fns.matched && fns.length) {
    that = this;
    fns.forEach(function (fn) {
      fn.apply(that);
    });
    return true;
  }
  
  return false;
};

//
// ### function Router (routes)
// #### @routes {Object} **Optional** Routing table for this instance.
// Constuctor function for the Router object responsible for building 
// and dispatching from a given routing table.
//
var Router = exports.Router = function (routes) {
  if (!(this instanceof Router)) return new Router(routes);
  
  this.routes   = {};
  this.methods  = ['on', 'after', 'before'];
  this._methods = {};
  
  this.configure();
  this.mount(routes || {});
  
  //
  // DONT DO THIS
  //
  this.delimiter = '/';
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
  for (var i = 0; i < this.methods.length; i++) {
    this._methods[this.methods[i]] = true;
  }
  
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
// ### function dispatch (method, path)
// #### @method {string} Method to dispatch
// #### @path {string} Path to dispatch
// #### @routes {Object} **Optional** Current route context in which to dispatch
// #### @fns {Array} **Optional** Call list to evaluate when complete.
// #### @regexp {string} **Optional** String representation of the regexp of the current context.
// Core routing logic for `director.Router`: traverses the
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

//
// ### function insert (method, path, route, context)
// #### @method {string} Method to insert the specific `route`.
// #### @path {Array} Parsed path to insert the `route` at.
// #### @route {Array|function} Route handlers to insert.
// #### @parent {Object} **Optional** Parent "routes" to insert into.
// Inserts the `route` for the `method` into the routing table for 
// this instance at the specified `path` within the `context` provided.
// If no context is provided then `this.routes` will be used.
//
Router.prototype.insert = function (method, path, route, parent) {
  var part = path.shift(),
      methodType,
      parentType,
      isArray,
      nested;
  
  parent = parent || this.routes;
  
  if (path.length > 0) {
    //
    // If this is not the last part left in the `path`
    // (e.g. `['cities', 'new-york']`) then recurse into that 
    // child 
    //
    parent[part] = parent[part] || {};
    return this.insert(method, path, route, parent[part]);
  }
  
  //
  // Otherwise, we are at the end of our insertion so we should
  // insert the `route` based on the `method` after getting the
  // `parent` of the last `part`.
  //
  // Remark (indexzero): Need browser-compatible implementation of `Array.isArray`.
  //
  parentType = typeof parent[part];
  isArray = Array.isArray(parent[part]);
  
  if (parent[part] && !isArray && parentType == 'object') {
    methodType = typeof parent[part][method];
    switch (methodType) {
      case 'function': 
        parent[part][method] = [parent[part][method], route];
        return;
      case 'object':
        parent[part][method].push(route)
        return;
      case 'undefined':
        parent[part][method] = route;
        return;
    }
  }
  else if (parentType == 'undefined') {
    nested = {};
    nested[method] = route;
    parent[part] = nested;
    return;
  }
  
  throw new Error('Invalid route context: ' + parentType);
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
Router.prototype.mount = function (routes, path) {
  if (!routes || typeof routes !== 'object' || Array.isArray(routes)) {
    return;
  }

  var self = this;
  path = path || [];

  function insertOrMount (route, local) {    
    //
    // route = '/foo',
    // parts = ['/foo']
    // rename = route = '/foo',
    // isRoute = true
    // event = 'on'
    //
    var rename = route,
        parts = route.split(self.delimiter),
        routeType = typeof routes[route],
        isRoute = parts[0] === '' || !self._methods[parts[0]],
        event = isRoute ? 'on' : rename;
    
    //
    // If the current part of this route is not
    // a reserved keyword (e.g. 'on', 'after', etc).
    // then assume it is a route and trim the delimiter.
    //
    // Remark: Should we throw if route does not include a delimter?
    //
    if (isRoute) {
      rename = rename.slice(self.delimiter.length);
      parts.shift();
    }

    //
    // **Recursive case:**
    // If it is a route and the contents are an `Object`, but not
    // an `Array`, then we can assume recursion.
    //
    if (isRoute && (routeType === 'object' && !Array.isArray(routes[route]))) {
      if (/\:|\*/.test(parts[0])) {
        parts[0] = regifyString(parts[0]);
      }
      
      //
      // path = ['foo']
      //
      local = local.concat(parts);
      
      //
      // Recursively call this.mount with the nested path
      //
      self.mount(routes[route], local);
      return;
    }

    //
    // **Base case:**
    // Rename the route, split it again and perform the 
    // necessary insertion.
    //
    if (/\:|\*/.test(rename)) {
      rename = regifyString(rename);
    }

    if (isRoute) {
      local = local.concat(rename.split(self.delimiter));
    }

    self.insert(event, local, routes[route]);
  }

  for (var route in routes) {
    if (routes.hasOwnProperty(route)) {
      insertOrMount(route, path.slice(0));
    }
  }
};
