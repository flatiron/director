;!function(window, undefined) {

  var dloc = document.location;

  window.Router = Router;
  
  function Router(routes) {

    if(!(this instanceof Router)) return new Router(routes);

    var self = this; 

    this.routes = routes;
    this.recurse = null;
    this.resource = null;
    this.state = {};
    this.after = [];
    this.on = [];
    this.oneach = [];
    this.aftereach = [];
    this.notfound = null;
    this.lastroutevalue = null;

    function dispatch(src) {

      for (var i=0, l = self[src].length; i < l; i++) {

        var listener = self[src][i];
        var val = listener.val === null ? self.lastroutevalue : listener.val;

        if(typeof listener.fn === 'string') {
          listener.fn = self.resource[listener.fn];
        }

        if(listener.fn.call(self.resource || null, val) === false) {

          self[src] = [];
          return false;
        }
        if(listener.val !== null) {
          self.lastroutevalue = listener.val;
        }
      }
      return true;
    }

    function parse(routes, path) {

      var partialpath = path.shift();
      var keys = [];
      
      var route = routes['/' + partialpath];

      if(!route) { // optimized for the simple case.
        for(var r in routes) {
          exp = new RegExp(r.slice(1)).exec(partialpath);

          if(exp && exp[1]) {
            route = routes[r];
            break;
          }
        }
      }

      var type = ({}).toString.call(route);

      var isObject = type.indexOf('Object') !== -1;
      var isFunction = type.indexOf('Function') !== -1;
      var isArray = type.indexOf('Array') !== -1;
      var isString = type.indexOf('String') !== -1;

      var add = self.recurse === 'backward' ? 'unshift' : 'push';
      var fn = null;

      if(route === undefined && path.length === 0) {
        self.noroute(partialpath);
        return false;
      };
      
      if((route && path.length === 0) || self.recurse !== null) {

        if(route.state) {
          self.state = route.state;
        }

        fn = route.on || route.once;
        
        if(isObject && route.after) {
          self.after[add]({ fn: route.after || route.once, val: partialpath });
        }

        if(isObject && fn) {

          if(({}).toString.call(fn).indexOf('Array') !== -1) {
            for (var i=0, l = fn.length; i < l; i++) {
              self.on[add]({ fn: fn[i], val: partialpath  });
            }
          }
          else {
            self.on[add]({ fn: fn || route.once, val: partialpath });
          }
          if(route.once) { 
            route.once = (function(){
              return function() { if(self.notfound) { self.noroute(partialpath); } return false; };
            }());
          }
        }
        else if(isArray) {
          for (var i=0, l = route.length; i < l; i++) {
            self.on[add]({ fn: route[i], val: partialpath  });
          }
        }
        else if(isFunction || isString) {
          self.on[add]({ fn: route, val: partialpath });        
        }
        
        if(self.recurse === null) {
          return true;
        }
      }

      if(isObject && path.length > 0) {
        parse(route, path);
      }
      
      return true;
    }

    function route(event) {

      var loc = dloc.hash.split('/').slice(1);

      dispatch('after');
      dispatch('aftereach');

      self.after = [];

      if(parse(self.routes, loc)) {
        dispatch('on');
        dispatch('oneach');
        self.on = [];
      }
    }

    this.init = function() {
      listener.init(route);
      route();
      return this;
    };

    return this;
  };

  Router.prototype.use = function(conf) {
    
    for(var item in conf) {
      if(conf.hasOwnProperty(item)) {

        if(item === 'recurse') {
          this.recurse = conf[item];
          continue;
        }
        
        if(item === 'resource') {
          this.resource = conf[item];
          continue;
        }
        
        if(item === 'notfound') {
          this.notfound = conf[item];
          continue;
        }

        var fn = conf[item];
        var store = null;
        var type = ({}).toString.call(fn);

        if(item === 'on') { store = 'oneach'; }
        if(item === 'after') { store = 'aftereach'; }

        if(type.indexOf('Array') !== -1) {
          for (var i=0, l = fn.length; i < l; i++) {
            this[store].push({ fn: fn[i], val: null });
          }
        }
        else {
          this[store].push({ fn: fn, val: null });
        }
      }
    }
    return this;
  };

  Router.prototype.noroute = function(routename) {    
    if(this.notfound) {
      if(({}).toString.call(this.notfound).indexOf('Array') !== -1) {
        for (var i=0, l = this.notfound.length; i < l; i++) {
          this.notfound[i](routename);
        }
      }
      else {
          this.notfound(routename);
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

    listener.setHash(url.join("/"));
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

  var version = '0.3.0',
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
      };

      if('onhashchange' in window && 
          (document.documentMode === undefined || document.documentMode > 7)) {
        window.onhashchange = onchange
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
        
        this.onHashChanged = onchnage;
        mode = 'legacy';
      }

      window.Router.listeners.push(fn);      
      
      return mode;
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
 
}(window);