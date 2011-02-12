;var SS = (typeof SS != 'undefined') ? SS : { // SugarSkull

  version: '0.2.1',
  mode: 'compatibility',

  router: function() {
    var self = this,
        first = false,
        state = {},
        hostObject,
        routes,
        onleave;

    if(arguments.length > 1) { // a hostObject is not required.
      hostObject = arguments[0];
      routes = arguments[1];
    }
    else {
      routes = arguments[0];
    }

    this.retired = [];
    this.routes = routes;

    function explodeURL() {
      var v = SS.mode == 'modern' ? document.location.pathname : document.location.hash;
      return v.slice(1, v.length).split("/");
    }

    function escapeRegExp(s) {
      return s.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1');
    }

    function execMethods(methods, route, values) {
      for (var i=0; i < methods.length; i++) {

        if(!self.retired[methods[i]]) {
          if(hostObject && hostObject[methods[i]] && typeof methods[i] == "string") {
            hostObject[methods[i]].apply(hostObject, values);
          }
          else if(typeof methods[i] != "string"){
            methods[i].apply(null, values);
          }
          else {
            throw new Error("sugarskull: '"+methods[i]+"' method not found on route '" + route + "'.");
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
      var v = self.mode == 'compatibility' ? document.location.hash : document.location.pathname;
      v = v.slice(1);
      
      execPartialRoute(routes, route, v);
    }

    function execPartialRoute(routes, route, target) {
      var exp = new RegExp(route.substr(1, route.length - 2) + '(.*)?').exec(target);
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
                execPartialRoute(routes[route], nestedRoute, next);
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

    SS.listener.init(routingAgent); // support for older browsers

    first = false;

    return {

      getState: function() {
        return self.state;
      },

      getRetired: function() {
        return self.retired;
      },

      getRoute: function(v) {

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
      },

      setRoute: function(v, qty, val) {
          
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

        SS.listener.setStateOrHash(self.state || {}, v || val, url.join("/"));
        return url;
                      
      },

      createRoute: function() {

      },

      removeRoute: function() {

      }

    };
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
      if(SS.mode == 'modern') {
        window.onpopstate();
      }
      else if(SS.mode == 'compatibility') {
        window.onhashchange();
      }
      else {
        this.onHashChanged();
      }
    },

    init: function (fn) {

      var self = this;

      if(window.history && window.history.pushState) {

        var links = document.querySelectorAll("a");

        for(var i=0; i < links.length; i++) {

          if(links[i].href.indexOf("#") !== -1 && links[i].className.indexOf("setRoute") != -1) {

            links[i].addEventListener('click', function(e) {
              window.history.pushState(
                {}, 
                this.firstChild.nodeValue, 
                "/" + this.href.substr((this.href.indexOf("#")+1), this.href.length)
              );
              window.onpopstate();
              return e.preventDefault();
            });

          }
        }
        
        window.onpopstate = fn;
        return SS.mode = 'modern';
      } 
      else if('onhashchange' in window && 
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

    setStateOrHash: function (v, t, s) {

      if(SS.mode == 'modern') {
        window.history.pushState(v, t, s);
        return this;
      }

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
