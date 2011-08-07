(function(window, undefined) {

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

        if(typeof val === 'string') {
          val = [val];
        }

        if(listener.fn.apply(self.resource || null, val || []) === false) {
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
      //path is an array
      var partialpath = path.shift();

      var route = routes['/' + partialpath];
      var opts = [], leftovers;

      if(!route) { // optimized for the simple case
        for(var r in routes) {
          leftovers = '/' + partialpath + '/' + path.join('/');
          opts = leftovers.match(new RegExp('^' + r + '$'));
          if(opts && opts.length > 1) {
            //IE8 has a bug that causes splice to fail without explicit howmany arg
            opts = opts.splice(1, opts.length); // remove the match origin

            for(var i=0, l=opts.length; i<l; i++) { // remove blanks
              if(opts[i] === '') {
                opts.splice(i, 1);
              }
            }
            path = []; // remove the path
          }

          if(opts && opts.length > 0) {
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
      }

      if((route && path.length === 0) || self.recurse !== null) {

        if(route.state) {
          self.state = route.state;
        }

        fn = route.on || route.once;

        if(isObject && route.after) {
          self.after[add]({ fn: route.after || route.once, val: opts });
        }

        if(isObject && fn) {

          if(({}).toString.call(fn).indexOf('Array') !== -1) {
            for (var j=0, m = fn.length; j < m; j++) {
              self.on[add]({ fn: fn[j], val: partialpath  });
            }
          }
          else {
            self.on[add]({ fn: fn || route.once, val: opts });
          }
          if(route.once) { 
            route.once = (function(){
              return function() { if(self.notfound) { self.noroute(partialpath); } return false; };
            }());
          }
        }
        else if(isArray) {
          for (var p=0, q = route.length; p < q; p++) {
            self.on[add]({ fn: route[p], val: opts  });
          }
        }
        else if(isFunction || isString) {
          self.on[add]({ fn: route, val: opts });        
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
  }

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
 
})(window);