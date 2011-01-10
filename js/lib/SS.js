
var SS = (typeof SS != 'undefined') ? SS : { // SugarSkull

  version: '0.2.0',

  router: function() {

    var self = this, 
        first = false, 
        hasFirstRoute = false, 
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

    this.retired = {};
    this.routes = routes;
    
    function explodeHash() {
      var h = document.location.hash;
      return h.slice(1, h.length).split("/");
    }
    
    function execMethods(methods, route) {

      for (var i=0; i < methods.length; i++) {

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
    
    function execRoute(routes, route) {

      if(new RegExp(route).test(window.location.hash) && !self.retired[route]) {
      
        if(routes[route].once === true) {
          self.retired[route] = true;
        }
        else if(routes[route].once) {
          execMethods(routes[route].once, route);
        }
      
        if(routes[route].on) {
          execMethods(routes[route].on, route);
        }
      
        onleave = routes[route].onleave || null;
      
      }
    }
    
    function verifyCurrentRoute() {
      for(var route in routes) {
        if (routes.hasOwnProperty && route == window.location.hash) {
          return true;
        }
      }
      return false;
    }
    
    function eventRoute() {

      var routes = self.routes;
      
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
        if (routes.hasOwnProperty) {
          execRoute(routes, route);
        }
      }

      if(routes.afterall) {
        execMethods(routes.afterall.on); // methods to be fired after every route.
      }      

    } 


    SS.hashListener.Init(eventRoute); // support for older browsers

    for(var route in routes) {
      if (routes.hasOwnProperty) {
        if(routes[route].first) {
          SS.hashListener.setHash(route);
          SS.hashListener.check();
          hasFirstRoute = true;
          break;
        }
      }
    }

    if(!verifyCurrentRoute() && routes.notfound) {
      execMethods(routes.notfound.on);
    }
    else if(!hasFirstRoute && window.location.hash.length > 0) {
      SS.hashListener.onHashChanged();
    }

    first = false;    

    return {
      
      getRoute: function(v) {

        // if v == number, returns the value at that index of the hash.
        // if v == string, returns the index at which it was found.
        // else returns an array which represents the current hash.

        if(typeof v == "number") {
          return explodeHash()[v];
        }
        else if(typeof v == "string"){
          var h = explodeHash();
          return h.indexOf(v);
        }
        else {
          return explodeHash();
        }
      },

      setRoute: function(v, qty, val) {
          
        var hash = explodeHash();
        
        if(typeof v == "string") {
          hash = [v];
        }
        else if(v !== false && qty !== false && val !== false) {
          hash.splice(v, qty, val);
        }
        else if(v !== false && qty !== false) {
          hash.splice(v, qty);
        }
        else {
          throw new Error("setRoute: not enough args.")
        }
        
        SS.hashListener.setHash(hash.join("/"));
        return hash;
                      
      },

      createRoute: function() {

      },

      removeRoute: function() {

      }
      
    };
    
  },

  hashListener: { // original concept by Erik Arvidson

    ie: /MSIE/.test(navigator.userAgent),
    ieSupportBack:  true,
    hash: document.location.hash,
    nativeHash: true,

    check:  function () {
      var h = document.location.hash;
      if (h != this.hash) {
        this.hash = h;
        this.onHashChanged();
      }
    },

    Init: function (fn) {

      if('onhashchange' in window && 
          ( document.documentMode === undefined || document.documentMode > 7 )) { 
        // support for Modern Browsers
        window.onhashchange = fn;
      }
      else {

        // for IE we need the iframe state trick
        if (this.ie && this.ieSupportBack) {
          var frame = document.createElement('iframe');
          frame.id = 'state-frame';
          frame.style.display = 'none';
          document.body.appendChild(frame);
          this.writeFrame('');
        }

        var self = this;

         // IE
        if ('onpropertychange' in document && 'attachEvent' in document) {
          document.attachEvent('onpropertychange', function () {
            if (event.propertyName == 'location') {
              self.check();
            }
          });
        }
                   
        this.onHashChanged = fn;
        this.nativeHash = false;        
      }

      if(!this.nativeHash) {
        // poll for changes of the hash
        window.setInterval(function () { self.check(); }, 50);        
      }
    },

    setHash: function (s) {
      // Mozilla always adds an entry to the history
      if (this.ie && this.ieSupportBack) {
        this.writeFrame(s);
      }
      document.location.hash = s;
      return this;
    },

    getHash: function () {
      return document.location.hash;
    },

    writeFrame: function (s) {
      var f = document.getElementById('state-frame');
      var d = f.contentDocument || f.contentWindow.document;
      d.open();
      d.write("<"+"script>window._hash = '" + s + "'; window.onload = parent.hashListener.syncHash;<\/"+"script>");
      d.close();
    },

    syncHash: function () {
      var s = this._hash;
      if (s != document.location.hash) {
        document.location.hash = s;
      }
      return this;
    },

    onHashChanged:  function () {}
  }

};
