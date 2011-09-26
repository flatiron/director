

var Router  = exports.Router  = require('./director/router').Router,
    methods = exports.methods = require('./director/methods');

//
// ### Extend the `Router` prototype with all of the RFC methods.
//
Router.prototype.extend.call(Router.prototype, methods);