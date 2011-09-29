

var Router  = exports.Router  = require('./SS/router').Router,
    methods = exports.methods = require('./SS/methods');

//
// ### Extend the `Router` prototype with all of the RFC methods.
//
Router.prototype.extend.call(Router.prototype, methods);