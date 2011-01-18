var SS = (typeof SS != 'undefined') ? SS : { // SugarSkull

  version: '0.2.0',
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

    function execMethods(methods, route) {

      for (var i=0; i < methods.length; i++) {

        if(!self.retired[methods[i]]) {
          if(hostObject && typeof methods[i] == "string") {
            hostObject[methods[i]].call(hostObject);
          }
          else if(typeof methods[i] != "string"){
            methods[i]();
          }
          else {
            throw new Error("exec: method not found on route '" + route + "'.");
          }          
        }
      }
    }

    function routeFork(routes, route) {
      if(routes[route].once === true) {
        self.retired[route] = true;
      }
      else if(routes[route].once) {
        execMethods(routes[route].once, route);
        delete routes[route].once;
      }

      if(routes[route].on) {
        execMethods(routes[route].on, route);
      }

      onleave = routes[route].onleave || null;
    }

    function execRoute(routes, route) {

      var v = self.mode == 'compatibility' ? document.location.hash : document.location.pathname;
      v.slice(1, v.length);

      var exp = new RegExp(route).exec(v);

      if(exp && exp.length > 0 && !self.retired[route]) {

        if(routes[route].state) {
          self.state = routes[route].state;
        }

        for(var i=1; i < exp.length; i++) { // capture group defs...

          if(String(i) in routes[route]) {

            var matchGroup = routes[route][i];
            for(var member in matchGroup) {
              if (matchGroup.hasOwnProperty(member)) {

                if(member === exp[i]) {

                  if(matchGroup[member].state) {
                    self.state = matchGroup[member].state;
                  }

                  routeFork(matchGroup, member);

                }
              }
            }
          }
        }

        routeFork(routes, route);

      }
    }

    function verifyCurrentRoute() { // verify that there is a matching route.

      var v = self.mode == 'compatibility' ? document.location.hash : document.location.pathname;
      v.slice(1, v.length);

      for(var route in routes) {
        if (routes.hasOwnProperty(route) && new RegExp(route).test(v)) {
          return true;
        }
      }
      return false;
    }

    function eventRoute(event) {

      var routes = self.routes;

      if(event && event.state) {
        state = event.state;
      }

      if(!verifyCurrentRoute() && routes.notfound) {
        execMethods(routes.notfound.on);
        return;
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

    SS.listener.init(eventRoute); // support for older browsers

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
        else if(v !== false && qty !== false && val !== false) {
          url.splice(v, qty, val);
        }
        else if(v !== false && qty !== false) {
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