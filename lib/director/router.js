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

function dispatch (method, path, routes, fns, regexp) {
  if (!path) {
    path = method;
    method = 'on';
  }
  
  //
  // Setup optional parameters.
  //
  fns    = fns    || [];
  routes = routes || this.routes;
  regexp = regexp || '';
  
  var route = routes[path],
      current,
      approx,
      exact,
      that;
  
  //
  // **TODO: Finish refactoring this function below here**
  //

  //
  // If there isn't an exact match then explore
  // the current `routes`.
  //
  // if (!route || path === '/') {
  //    for (var r in routes) {
  //      if (routes.hasOwnProperty(r)) {
  //        current = regexp + this.delimiter + r;
  //        exact   = path.match(new RegExp('^' + current));
  //        approx  = path.match(new RegExp('^' + current + '(.*)?'));
  //        
  //        if (exact && approx) {
  //          // convert roughmatch to an array of names without `/`s.
  //          for (var i = approx.length; i >= 0; i--) {
  //            if (approx[i]) {
  //              approx[i] = approx[i].replace(/^\//, '');
  //            }
  //            else {
  //              approx.splice(i, 1);
  //            }
  //          }
  // 
  //          if (exact[0] === '/' && approx.length > 1 
  //            && '/([a-zA-Z0-9-]+)' in routes) {
  //            continue;
  //          }
  // 
  //          var partsCount = exact[0].split('/').length - 1,
  //              _path = approx.slice(exactmatch.length),
  //              _len = len - partsCount,
  //              _matched = matched.concat(exactmatch.slice(1));
  // 
  //          if (exact.length > 1) {
  //            route = routes[r];
  //          }
  //          else {
  //            route = routes[exact[0]];
  //          }
  // 
  //          if (next(_path, _len, _matched)) return true;
  //        }
  //      }
  //    }
  //  }
  //  else {
  //    _len = len - path.split('/').length + 1;
  //  }
  //  
  //  next('/', _len, matched);
  // 
  //  function next(path, len, matched) {
  //    if (route) {
  // 
  //      if (typeof path !== 'string') {
  //        path = '/' + path.join('/');
  //      }
  // 
  //      if (path !== '/') {
  //        parse(route, path, len, matched);
  //      }
  // 
  //      if (len === 0 || self._recurse) {
  // 
  //        function queue(fn, type) {
  //          if (fn && typeof fn !== 'string' && fn[0]) {
  //            for (var j = 0, m = fn.length; j < m; j++) {
  //              self.events[type][add]({ fn: fn[j], val: matched || path });
  //            }
  //          }
  //          else {
  //            self.events[type][add]({ fn: fn, val: matched || path });
  //          }
  //        };
  // 
  //        if (typeof route === 'function' || route.on) {
  //          queue(route.on || route, 'on');
  //        }
  // 
  //        if (route.once && !route.once._fired){
  //          route.once._fired = true;
  //          queue(route.once, 'once');
  //        }
  // 
  //        if (route.after){
  //          queue(route.after, 'after');
  //        }
  // 
  //        return true;
  //      }
  //    }
  //    else {
  //      self.noroute(matched);
  //    }
  //  };
  
  //
  // **TODO: Finish refactoring this function above here**
  //
  
  //
  // If the current route has the specified `method` or 
  // `on` function(s) then add them to the call list.
  //
  [method, 'on'].forEach(function (target) {
    if (route[target]) {
      fns.push(route[target]);
    }
  });
  
  //
  // If we have remaining parts of the `path` to 
  // explore, then do so.
  //
  if (path.length) {
    return this.dispatch(method, path, route, fns);
  }
  
  //
  // Otherwise, we have completely traversed the path, 
  // then evaluate all of the `fns` collected in the
  // curent context.
  //
  if (fns.length) {
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
  dispatch.call({
    req: req,
    res: res
  }, method, path, this.routes, [], '')
}

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
