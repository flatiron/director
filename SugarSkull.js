var SS = (typeof SS != "undefined") ? SS : {

  overrides: {},

  override: function(ns, first) {
      overrides[ns] = first;
  },

  router: {

    getRoute: function(hash) {

      var namedRoutes = this.namedRoutes;
      var finishedRoutes = this.finishedRoutes;
      hash = hash.slice(1, hash.length).split("/");

      for(name in namedRoutes) {

        var route = namedRoutes[name].route;
        var match = false, finsihed = false;
  
        for (var i=0; i < finishedRoutes.length; i++) {
          if(name === finishedRoutes[i]) {
            finsihed = true; break;
          }
        }

        if(!finsihed && route) {
          
          for (var i=0; i < route.length; i++) {
            if(route[i] === hash[i] || route[i] === "*") {
              match = true;
            }
            else {
              match = false; break;
            }
          }

          if(match && route.length === hash.length) {
            if(namedRoutes[name].once && namedRoutes[name].once === true) {
              this.finishedRoutes.push(name);
            }
            namedRoutes[name].name = name;
            return namedRoutes[name];
          }
        }
        else {
          return namedRoutes["default"];
        }
      }

    },

    finishedRoutes: [],
    namedRoutes: {},
    leaveLastRoute: [],
    leaveAllRoutes: [],
    onAllRoutes: []

  },

  exec: function(scope, params) {

    var self = this
        ,strNS = params.ns
        ,ns = {}
        ,sectors = strNS.split('.')
        ,methods
        ,isArray = (function() { return Array.isArray || function(obj) {
            return !!(obj && obj.concat && obj.unshift && !obj.callee);
        }})();

    this.router.namedRoutes = params.routes;
    this.router.onAllRoutes = params.onAllRoutes;
    this.router.leaveAllRoutes = params.leaveAllRoutes;

    var i = 0, len = sectors.length;

    for (i; i < sectors.length; i++) {
      var sector = sectors[i];

      if (i == 0 && !window[sector]) {
        window[sector] = {};
        ns = window[sector];
      }
      else {
        ns = ns[sector] = (ns[sector] ? ns[sector] : {});
      }
    }

    delete this.Main;
    eval(params.ns + " = this;"); // To-Do: there may be a better way to do this assignment.

    firstMethods = (typeof SS.overrides[ns] == "undefined") ?
      params.first : SS.overrides[ns];

    function fireMethods(methods, routeName) {

      if(isArray(methods)) {
        for (var i=0; i < methods.length; i++) {
          
          if(isArray(methods[i])) { // could be an array of function names with parameters.
            var params = methods[i].slice(1, methods[i].length);
            if(routeName) { params.push(routeName); }
            scope[methods[i][0]].call(scope, params);            
          }
          else { // could be an array of function names
            scope[methods[i]].call(scope, routeName);
          }
        }
      }
      else { // could just be a function name
        scope[methods].call(scope, routeName);
      }
    }

    fireMethods(firstMethods, "first");

    this.hashListener.Init(function() { 
      
      // To-Do: Rather than Init accepting a function it should push a function into an array of functions that are called by the 
      // onHashChanged event so that exec can be called multiple times within the same file and not overwrite.

      var r = self.router;
      var route = r.getRoute(self.hashListener.hash);
      
      var routeName = route.name;

      fireMethods(r.leaveAllRoutes, routeName);
      fireMethods(r.leaveLastRoute, routeName);
      r.leaveLastRoute = [];
      
      if(r.onAllRoutes) { fireMethods(r.onAllRoutes, routeName); }

      if(route) { // if the route is a match with the current hash.
        fireMethods(route.on, routeName);
        if(route.leave) { r.leaveLastRoute = route.leave; };
      }
    });  

  },

  hashListener: { // original concept by Erik Arvidson

    ie:		/MSIE/.test(navigator.userAgent),
  	ieSupportBack:	true,
  	hash:	document.location.hash,

  	check:	function () {
  		var h = document.location.hash;
  		if (h != this.hash) {
  			this.hash = h;

  			this.onHashChanged();
  		}
  	},

  	Init:	function (fn) {
      
      this.onHashChanged = fn;

  		// for IE we need the iframe state trick
  		if (this.ie && this.ieSupportBack) {
  			var frame = document.createElement("iframe");
  			frame.id = "state-frame";
  			frame.style.display = "none";
  			document.body.SSendChild(frame);
  			this.writeFrame("");
  		}

  		var self = this;

  		// IE
  		if ("onpropertychange" in document && "attachEvent" in document) {
  			document.attachEvent("onpropertychange", function () {
  				if (event.propertyName == "location") {
  					self.check();
  				}
  			});
  		}
  		// poll for changes of the hash
  		window.setInterval(function () { self.check() }, 50);
  	},

  	setHash: function (s) {
  		// Mozilla always adds an entry to the history
  		if (this.ie && this.ieSupportBack) {
  			this.writeFrame(s);
  		}
  		document.location.hash = s;
  	},

  	getHash: function () {
  		return document.location.hash;
  	},

  	writeFrame:	function (s) {
  		var f = document.getElementById("state-frame");
  		var d = f.contentDocument || f.contentWindow.document;
  		d.open();
  		d.write("<script>window._hash = '" + s + "'; window.onload = parent.hashListener.syncHash;<\/script>");
  		d.close();
  	},

  	syncHash:	function () {
  		var s = this._hash;
  		if (s != document.location.hash) {
  			document.location.hash = s;
  		}
  	},

  	onHashChanged:	function () {}
  }
};