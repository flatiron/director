(function(window, undefined) {

  var dloc = document.location;

  function regifyString(str) {
    if(~str.indexOf('*')) {
      str = str.replace(/\*/g, '([a-zA-Z0-9-]+)');
    }
    if(~str.indexOf(':')) {
      str = str.replace(/:.*?\/|:.*?$/g, '([a-zA-Z0-9-]+)/');
      str = str.slice(0, -1);
    }
    return str;
  }

  function regifyObject(routes) { // convert all simple param routes to regex
    if (typeof routes === 'string') {
      return false;
    }
    for (var key in routes) {
      regifyObject(routes[key]);
      if (key.indexOf(':') !== -1 || key.indexOf('*') !== -1) {
        var newKey = regifyString(key);
        routes[newKey] = routes[key];
        delete routes[key];
      }
    }
  }

  window.Router = Router;
  
  function Router(routes) {

    if(!(this instanceof Router)) return new Router(routes);

    var self = this; 

    this.routes = routes;

    var add;

    this.recurse = function(value) {
      if (value === undefined) return recurse;
      add = (this._recurse = value) === 'forward' ? 'unshift' : 'push';
    };

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

      if(!route || path === '/') {
        for (var r in routes) { // we dont have an exact match, lets explore.
          if(routes.hasOwnProperty(r)) {

            exactmatch = path.match(new RegExp('^' + r));
            roughmatch = path.match(new RegExp('^' + r + '(.*)?'));
            
            if(exactmatch && roughmatch) {

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

          if(typeof path !== 'string') {
            path = '/' + path.join('/');
          }

          if (path !== '/') {
            parse(route, path, len, matched);
          }

          if (len === 0 || self._recurse) {

            function queue(fn, type) {
              if(fn && typeof fn !== 'string' && fn[0]) {
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

      if(parse(self.routes, loc, len, [])) {
        dispatch('on');
        dispatch('once');
        dispatch('oneach');
        self.events.on = [];
        self.events.once = [];
      }

      dispatch('after');
      dispatch('aftereach');
    }

    this.init = function(r) {

      if(dloc.hash === '' && r) { 
        dloc.hash = r; 
      }

      if(dloc.hash.length > 0) {
        route();
      }

      listener.init(route);
      return this;
    };

    this.destroy = function() {
      listener.destroy(route);
      return this;
    };

    return this;
  }

  Router.prototype.use = function(conf) {

    for(var item in conf) {
      if(conf.hasOwnProperty(item)) {

        if(item === 'recurse') {
          this.recurse(conf[item]);
          continue;
        }

        if(item === 'resource') {
          this.resource = conf[item];
          continue;
        }

        if(item === 'notfound') {
          this.events.notfound = conf[item];
          continue;
        }

        var fn = conf[item];
        var store = null;
        var type = ({}).toString.call(fn);

        if(item === 'on') { store = 'oneach'; }
        if(item === 'after') { store = 'aftereach'; }

        if(type.indexOf('Array') !== -1) {
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
    if(this.events.notfound) {
      if(({}).toString.call(this.events.notfound).indexOf('Array') !== -1) {
        for (var i=0, l = this.events.notfound.length; i < l; i++) {
          this.events.notfound[i](routename);
        }
      }
      else {
          this.events.notfound(routename);
      }
    }    
  };

  Router.prototype.explode = function() {
    var v = dloc.hash;
    if(v[1] === '/') { v=v.slice(1); }
    return v.slice(1, v.length).split("/");
  };

  Router.prototype.setRoute = function(i, v, val) {

    var url = this.explode();

    if(typeof i === 'number' && typeof v === 'string') {
      url[i] = v;
    }
    else if(typeof val === 'string') {
      url.splice(i, v, s);
    }
    else {
      url = [i];
    }

    listener.setHash(url.join('/'));
    return url;
  };
  
  Router.prototype.getState = function() {
    return this.state;
  };
  
  Router.prototype.getRoute = function(v) {

    var ret = v;

    if(typeof v === "number") {
      ret = this.explode()[v];
    }
    else if(typeof v === "string"){
      var h = this.explode();
      ret = h.indexOf(v);
    }
    else {
      ret = this.explode();
    }
    
    return ret;
  };

  Router.prototype.on = function(route, cb) {

    var compiledRoute;

    if(this.route) {
      compiledRoute = this.route[regifyString(route)];
    }
    else {
      compiledRoute = this.route = this.routes[regifyString(route)] = {
        on: null
      };
    }

    if(compiledRoute) {
      compiledRoute.on = cb;
    }
  };

  var version = '0.4.0',
      mode = 'modern',
      listener = { 

    hash: dloc.hash,

    check:  function () {
      var h = dloc.hash;
      if (h != this.hash) {
        this.hash = h;
        this.onHashChanged();
      }
    },

    fire: function() {
      if(mode === 'modern') {
        window.onhashchange();
      }
      else {
        this.onHashChanged();
      }
    },

    init: function (fn) {

      var self = this;

      if(!window.Router.listeners) {
        window.Router.listeners = [];
      }
      
      function onchange() {
        for(var i = 0, l = window.Router.listeners.length; i < l; i++) {
          window.Router.listeners[i]();
        }
      }

      //note IE8 is being counted as 'modern' because it has the hashchange event
      if('onhashchange' in window && 
          (document.documentMode === undefined || document.documentMode > 7)) {
        window.onhashchange = onchange;
        mode = 'modern';
      }
      else { // IE support, based on a concept by Erik Arvidson ...

        var frame = document.createElement('iframe');
        frame.id = 'state-frame';
        frame.style.display = 'none';
        document.body.appendChild(frame);
        this.writeFrame('');

        if ('onpropertychange' in document && 'attachEvent' in document) {
          document.attachEvent('onpropertychange', function () {
            if (event.propertyName === 'location') {
              self.check();
            }
          });
        }

        window.setInterval(function () { self.check(); }, 50);
        
        this.onHashChanged = onchange;
        mode = 'legacy';
      }

      window.Router.listeners.push(fn);      
      
      return mode;
    },

    destroy: function (fn) {
      if (!window.Router || !window.Router.listeners) return;

      var listeners = window.Router.listeners;

      for (var i = listeners.length - 1; i >= 0; i--) {
        if (listeners[i] === fn) {
          listeners.splice(i, 1);
        }
      }
    },

    setHash: function (s) {

      // Mozilla always adds an entry to the history
      if (mode === 'legacy') {
        this.writeFrame(s);
      }
      dloc.hash = (s[0] === '/') ? s : '/' + s;
      return this;
    },

    writeFrame: function (s) { 
      // IE support...
      var f = document.getElementById('state-frame');
      var d = f.contentDocument || f.contentWindow.document;
      d.open();
      d.write("<script>_hash = '" + s + "'; onload = parent.listener.syncHash;<script>");
      d.close();
    },

    syncHash: function () { 
      // IE support...
      var s = this._hash;
      if (s != dloc.hash) {
        dloc.hash = s;
      }
      return this;
    },

    onHashChanged:  function () {}
  };
 
}(window));
