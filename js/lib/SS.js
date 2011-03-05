

        
var SS = (typeof SS != 'undefined') ? SS : { // SugarSkull

  version: '0.2.0',
  mode: 'compatibility',
  origin: location.href,

  router: function(routes, hostObject) {
    var self = this,
        first = false,
        state = {},
        onleave;

    this.retired = [];
    this.routes = routes;
    
    function explodeURL() {
      var v = document.location.hash;
      return v.slice(1, v.length).split("/");
    }

    // function escapeRegExp(s) {
    //   return s.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1');
    // }

    function execMethods(methods, route, values) {
      if(!methods) {
        return fasle;
      }

      if(Object.prototype.toString.call(methods) !== '[object Array]') {
        methods = [methods];
      }

      for (var i=0; i < methods.length; i++) {

        if(!self.retired[methods[i]]) {
          if(hostObject && typeof methods[i] == "string") {
            hostObject[methods[i]].apply(hostObject, values);
          }
          else if(typeof methods[i] != "string"){
            methods[i].apply(null, values);
          }
          else {
            throw new Error("exec: method not found on route '" + route + "'.");
          }          
        }
      }
    }

    function dispatch(routes, route, values) {

      if(routes[route].once === true) {
        self.retired[route] = true;
      }
      else if(routes[route].once) {
        execMethods(routes[route].once, route, values);
        delete routes[route].once;
      }

      if(routes[route].on) {
        execMethods(routes[route].on, route, values);
      }

      onleave = routes[route].onleave || null;
    }

    function execRoute(routes, route) {
      
      // var v = self.mode == 'compatibility' ? document.location.hash : document.location.pathname;
      v = document.location.hash;
      v = v.slice(1);
      
      execPartialRoute(routes, route, v, 0);
    }

    function execPartialRoute(routes, route, target, level) {
      if (route[0] !== '/') {
        return;
      }

      var prefix = level === 0 ? '^\\/' : '',
          exp = new RegExp(prefix + route.slice(1) + '(.*)?').exec(target);
      
      if(exp && exp.length > 0 && !self.retired[route]) {
        // We've entered the route to start processing it
        if(routes[route].state) {
          self.state = routes[route].state;
        }

        var userGroups = exp.slice(1),
            next = userGroups.pop();
        
        // Dispatch this route
        dispatch(routes, route, userGroups);

        if (typeof next === 'string' && next.length > 0) {
          for (var nestedRoute in routes[route]) {
            if (routes[route].hasOwnProperty(nestedRoute)) {
              if (nestedRoute.indexOf('/') === 0) {
                // Recursive step
                execPartialRoute(routes[route], nestedRoute, next, ++level);
              }
            }
          }
        }
      }
    }

    function routingAgent(event) {
      var routes = self.routes;

      if(event && event.state) {
        state = event.state;
      }

      if(routes.beforeall) {
        execMethods(routes.beforeall.on); // methods to be fired before every route.
      }

      if(routes.leaveall && !first) {
        execMethods(routes.leaveall.on); // methods to be fired when leaving every route.
      }

      if(self.onleave) {
        execMethods(self.onleave); // fire the current 'onleave-route' method.
        self.onleave = null; // only fire it once.
      }

      for(var route in routes) {
        if (routes.hasOwnProperty(route)) {
          execRoute(routes, route);
        }
      }

      if(routes.afterall) {
        execMethods(routes.afterall.on); // methods to be fired after every route.
      }      

    }

    first = false;

    this.init = function() {
      SS.listener.init(routingAgent);
      routingAgent(); 
      return this;       
    };

    this.getState = function() {
      return self.state;
    };

    this.getRetired = function() {
      return self.retired;
    };

    this.getRoute = function(v) {

      // if v == number, returns the value at that index of the hash.
      // if v == string, returns the index at which it was found.
      // else returns an array which represents the current hash.

      if(typeof v == "number") {
        return explodeURL()[v];
      }
      else if(typeof v == "string"){
        var h = explodeURL();
        return h.indexOf(v);
      }
      else {
        return explodeURL();
      }
    };

    this.setRoute = function(v, qty, val) {

      var url = explodeURL();

      if(typeof v == "string") {
        url = [v];
      }
      else if(v && qty && val) {
        url.splice(v, qty, val);
      }
      else if(v && qty) {
        url.splice(v, qty);
      }
      else {
        throw new Error("setRoute: not enough args.");
      }

      SS.listener.setHash(self.state || {}, v || val, url.join("/"));
      return url;
                    
    };

    return this;
  },

  listener: { 

    hash: document.location.hash,

    check:  function () {
      var h = document.location.hash;
      if (h != this.hash) {
        this.hash = h;
        this.onHashChanged();
      }
    },

    fire: function() {
      if(SS.mode == 'compatibility') {
        window.onhashchange();
      }
      else {
        this.onHashChanged();
      }
    },

    init: function (fn) {

      var self = this;

      if('onhashchange' in window && 
          (document.documentMode === undefined || document.documentMode > 7)) { 

        window.onhashchange = fn;
        SS.mode = 'compatibility';        
      }
      else { // IE support, based on a concept by Erik Arvidson ...

        var frame = document.createElement('iframe');
        frame.id = 'state-frame';
        frame.style.display = 'none';
        document.body.appendChild(frame);
        this.writeFrame('');

        if ('onpropertychange' in document && 'attachEvent' in document) {
          document.attachEvent('onpropertychange', function () {
            if (event.propertyName == 'location') {
              self.check();
            }
          });
        }

        this.onHashChanged = fn;
        window.setInterval(function () { self.check(); }, 50);
        
        SS.mode = 'legacy';
      }
      return SS.mode;
    },

    setHash: function (v, t, s) {

      // Mozilla always adds an entry to the history
      if (SS.mode == 'legacy') {
        this.writeFrame(s);
      }

      document.location.hash = s;
      return this;
    },

    writeFrame: function (s) { // IE support...
      var f = document.getElementById('state-frame');
      var d = f.contentDocument || f.contentWindow.document;
      d.open();
      d.write("<"+"script>window._hash = '" + s + "'; window.onload = parent.listener.syncHash;<\/"+"script>");
      d.close();
    },

    syncHash: function () { // IE support...
      var s = this._hash;
      if (s != document.location.hash) {
        document.location.hash = s;
      }
      return this;
    },

    onHashChanged:  function () {}
  }

};