

var Router = exports.Router = function Router(routes) {
  if (!(this instanceof Router)) return new Router(routes);

  var self = this,
      add;

  this.routes = routes;

  this._recurse = null;
  this.recurse(null);

  this.resource = null;
  this.state = {};

  this.events = {};
  this.events.on = [];
  this.events.oneach = [];
  this.events.after = [];
  this.events.aftereach = [];
  this.events.once = [];
  this.events.notfound = null;

  this.route = null;
  this.lastroutevalue = null;
  this.alreadyrun = false;

  regifyObject(this.routes);

  function dispatch(src) {
    for (var i=0, l = self.events[src].length; i < l; i++) {

      var listener = self.events[src][i];
      var val = listener.val === null ? self.lastroutevalue : listener.val;
      
      if (typeof listener.fn === 'string') {
        listener.fn = self.resource[listener.fn];
      }
      
      if (typeof val === 'string') {
        val = [val];
      }
      
      if (listener.fn.apply(self.resource || self, val || []) === false) {
        self[src] = [];
        return false;
      }
      if (listener.val !== null) {
        self.lastroutevalue = listener.val;
      }
    
    }
  }

  function parse(routes, path, len, matched) {

    var roughmatch, exactmatch;
    var route = routes[path];

    if (!route || path === '/') {
      for (var r in routes) { // we dont have an exact match, lets explore.
        if (routes.hasOwnProperty(r)) {

          exactmatch = path.match(new RegExp('^' + r));
          roughmatch = path.match(new RegExp('^' + r + '(.*)?'));
          
          if (exactmatch && roughmatch) {

            // convert roughmatch to an array of names without `/`s.
            for (var i = roughmatch.length; i >= 0; i--) {
              if (roughmatch[i]) {
                roughmatch[i] = roughmatch[i].replace(/^\//, '');
              }
              else {
                roughmatch.splice(i, 1);
              }
            }

            if (exactmatch[0] === '/' && 
                roughmatch.length > 1 && 
                '/([a-zA-Z0-9-]+)' in routes) {
              continue;
            }

            var partsCount = exactmatch[0].split('/').length - 1,
                _path = roughmatch.slice(exactmatch.length),
                _len = len - partsCount,
                _matched = matched.concat(exactmatch.slice(1));

            if (exactmatch.length > 1) {
              route = routes[r];
            }
            else {
              route = routes[exactmatch[0]];
            }

            if (next(_path, _len, _matched)) return true;
          }
        }
      }
    } else {
      _len = len - path.split('/').length + 1;
    }

    next('/', _len, matched);

    function next(path, len, matched) {
      if (route) {

        if (typeof path !== 'string') {
          path = '/' + path.join('/');
        }

        if (path !== '/') {
          parse(route, path, len, matched);
        }

        if (len === 0 || self._recurse) {

          function queue(fn, type) {
            if (fn && typeof fn !== 'string' && fn[0]) {
              for (var j = 0, m = fn.length; j < m; j++) {
                self.events[type][add]({ fn: fn[j], val: matched || path });
              }
            }
            else {
              self.events[type][add]({ fn: fn, val: matched || path });
            }
          };

          if (typeof route === 'function' || route.on) {
            queue(route.on || route, 'on');
          }

          if (route.once && !route.once._fired){
            route.once._fired = true;
            queue(route.once, 'once');
          }

          if (route.after){
            queue(route.after, 'after');
          }

          return true;
        }
      }
      else {
        self.noroute(matched);
      }
    };
    return true;
  }

  function route(event) {

    var loc = dloc.hash.slice(1);
    var len = loc.split('/').length-1;

    self.events.after = [];

    if (parse(self.routes, loc, len, [])) {
      dispatch('on');
      dispatch('once');
      dispatch('oneach');
      self.events.on = [];
      self.events.once = [];
    }

    dispatch('after');
    dispatch('aftereach');
  }

  

  return this;
};

Router.prototype.use = function(conf) {
  for (var item in conf) {
    if (conf.hasOwnProperty(item)) {

      if (item === 'recurse') {
        this.recurse(conf[item]);
        continue;
      }

      if (item === 'resource') {
        this.resource = conf[item];
        continue;
      }

      if (item === 'notfound') {
        this.events.notfound = conf[item];
        continue;
      }

      var fn = conf[item];
      var store = null;
      var type = ({}).toString.call(fn);

      if (item === 'on') { store = 'oneach'; }
      if (item === 'after') { store = 'aftereach'; }

      if (type.indexOf('Array') !== -1) {
        for (var i=0, l = fn.length; i < l; i++) {
          this.events[store].push({ fn: fn[i], val: null });
        }
      }
      else {
        this.events[store].push({ fn: fn, val: null });
      }
    }
  }
  return this;
};

Router.prototype.noroute = function(routename) {    
  if (this.events.notfound) {
    if (({}).toString.call(this.events.notfound).indexOf('Array') !== -1) {
      for (var i=0, l = this.events.notfound.length; i < l; i++) {
        this.events.notfound[i](routename);
      }
    }
    else {
        this.events.notfound(routename);
    }
  }    
};

Router.prototype.on = function(route, cb) {

  var compiledRoute;

  if (this.route) {
    compiledRoute = this.route[regifyString(route)];
  }
  else {
    compiledRoute = this.route = this.routes[regifyString(route)] = {
      on: null
    };
  }

  if (compiledRoute) {
    compiledRoute.on = cb;
  }
};