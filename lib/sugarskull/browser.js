
/*
 * browser.js: Hash listening functionality for the router.
 *
 * (C) 2011, Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var exports = window;
var dloc = document.location;

var listener = {
  mode: 'modern',
  hash: dloc.hash,

  check: function () {
    var h = dloc.hash;
    if (h != this.hash) {
      this.hash = h;
      this.onHashChanged();
    }
  },

  fire: function () {
    if (this.mode === 'modern') {
      window.onhashchange();
    }
    else {
      this.onHashChanged();
    }
  },

  init: function (fn) {
    var self = this;

    if (!window.Router.listeners) {
      window.Router.listeners = [];
    }
  
    function onchange() {
      for (var i = 0, l = window.Router.listeners.length; i < l; i++) {
        window.Router.listeners[i]();
      }
    }

    //note IE8 is being counted as 'modern' because it has the hashchange event
    if ('onhashchange' in window && (document.documentMode === undefined ||
        document.documentMode > 7)) {
      window.onhashchange = onchange;
      this.mode = 'modern';
    }
    else { 
      //
      // IE support, based on a concept by Erik Arvidson ...
      //
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
      this.mode = 'legacy';
    }

    window.Router.listeners.push(fn);      
  
    return this.mode;
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

  onHashChanged: function () {}
};

//\top||bottom\/

Router.prototype.init = function (r) {
  if (dloc.hash === '' && r) { 
    dloc.hash = r; 
  }

  if (dloc.hash.length > 0) {
    route();
  }

  var self = this;
  listener.init(function() {
    self.dispatch('on', dloc.hash.replace(/^#/, ''));
  });

  return this;
};

Router.prototype.explode = function () {
  var v = dloc.hash;
  if (v[1] === '/') { v=v.slice(1); }
  return v.slice(1, v.length).split("/");
};

Router.prototype.setRoute = function (i, v, val) {
  var url = this.explode();

  if (typeof i === 'number' && typeof v === 'string') {
    url[i] = v;
  }
  else if (typeof val === 'string') {
    url.splice(i, v, s);
  }
  else {
    url = [i];
  }

  listener.setHash(url.join('/'));
  return url;
};

Router.prototype.getState = function () {
  return this.state;
};

Router.prototype.getRoute = function (v) {
  var ret = v;

  if (typeof v === "number") {
    ret = this.explode()[v];
  }
  else if (typeof v === "string"){
    var h = this.explode();
    ret = h.indexOf(v);
  }
  else {
    ret = this.explode();
  }
  
  return ret;
};

Router.prototype.destroy = function () {
  listener.destroy();
  return this;
};

Router.prototype.recurse = function (value) {
  if (value === undefined) {
    return recurse;
  }
  
  this.add = (this._recurse = value) === 'forward' 
    ? 'unshift' 
    : 'push';
};
