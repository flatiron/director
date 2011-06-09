;!function(window, undefined) {

  var dloc = document.location;

  this.Router = function(routes, hostObject) {

    if(!(this instanceof Router)) return new Router(routes, hostObject);

    var self = this,
        state = {},
        onleave;

    this.routes = routes;
    this.after = [];
    this.queue = [];

    function explodeURL() {
      var v = dloc.hash;
      if(v[1] === '/') { v=v.slice(1); }
      return v.slice(1, v.length).split("/");
    }

    function parseRoute(routes, rawRouteName, hashSeg, level) {

      var prefix = level === 0 ? '^\\/' : '', match;

      if (rawRouteName[0] === '/') {
        match = new RegExp(prefix + rawRouteName.slice(1) + '(.*)?').exec(hashSeg);
        hashSeg = match ? match[1] : hashSeg;
      }

      if (parseOption(routes, rawRouteName, match, hashSeg) && hashSeg !== 'undefined') {
        for(routeSeg in routes[rawRouteName]) {
          parseRoute(routes[rawRouteName], routeSeg, hashSeg, ++level);
        }
      }
      
      return !!match
    }

    function parseOption(routes, rawRouteName, match, hashSeg) {

      var type = ({}).toString.call(routes[rawRouteName]);
      var args = [hashSeg];
      var store = rawRouteName === 'after' ? 'after' : 'queue';

      if (~type.indexOf('Function')) {
        self[store].unshift({ val: args, fn: routes[rawRouteName] });
      }
      else if (~type.indexOf('Array')) {
        for (var i=0, l = routes[rawRouteName].length; i < l; i++) {
          self[store].unshift({ val: args, fn: routes[rawRouteName][i] });
        }
      }
      else if (~type.indexOf('String')) {
        self[store].unshift({ val: args, fn: hostObject[routes[rawRouteName]] });
      }
      else if (~type.indexOf('Object')) {
        return !!match;
      }

      if(rawRouteName === 'once') {
        routes[rawRouteName] = function() { return false; };
      }

      return false;
    }

    function dispatch(src) {
      for (var i=0, l = self[src].length; i < l; i++) {
        
        var listener = self[src].pop();
        
        if(listener.fn.apply(hostObject || null, listener.val) === false) {
          self[src] = [];
          return false;
        }
      }
      return true;
    }

    function router(event) {

      var routes = self.routes, match;
      dispatch('after');

      for (var route in routes) {
        if (routes.hasOwnProperty(route)) {

          if(!parseRoute(routes, route, dloc.hash.slice(1), 0)) {
            self.queue = [];
            continue;
          }

          if(!dispatch('queue')) {
            return false;
          }
        }
      }
    }

    this.init = function() {
      listener.init(router);
      router();
      return this;
    };

    this.getState = function() {
      return self.state;
    };

    this.getRoute = function(v) {

      // if v == number, returns the value at that index of the hash.
      // if v == string, returns the index at which it was found.
      // else returns an array which represents the current hash.

      var ret = v;

      if(typeof v === "number") {
        ret = explodeURL()[v];
      }
      else if(typeof v === "string"){
        var h = explodeURL();
        ret = h.indexOf(v);
      }
      else {
        ret = explodeURL();
      }
      
      return ret;
    };

    this.setRoute = function(i, v, val) {

      var url = explodeURL();

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

    return this;
  };

  var version = '0.3.0',
      mode = 'compatibility',
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
      if(mode === 'compatibility') {
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
        mode = 'compatibility';        
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

        this.onHashChanged = fn;
        window.setInterval(function () { self.check(); }, 50);
        
        mode = 'legacy';
      }
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
