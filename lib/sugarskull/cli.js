
var util = require('util'),
    sugarskull = require('../sugarskull'),
    optimist = require('optimist');

var Router = exports.Router = function (routes) {
  sugarskull.Router.call(this, routes);
};

//
// Inherit from `sugarskull.Router`.
//
util.inherits(Router, sugarskull.Router);

//
// ### function configure (options)
// #### @options {Object} **Optional** Options to configure this instance with
// Configures this instance with the specified `options`.
//
Router.prototype.configure = function (options) {
  options = options || {};
  //
  // Ignore most `options` since the CLI router is a 
  // specialized version of the Sugarskull `Router`.
  //
  this.async = options.async || false;

  //
  // Delimiter must always be `\s` in CLI routing.
  // e.g. `jitsu users create`
  //
  this.delimiter = '\\s';
  return this;
};

//
// ### function dispatch (method, path)
// #### @method {string} Method to dispatch
// #### @path {string} Path to dispatch
// Finds a set of functions on the traversal towards
// `method` and `path` in the core routing table then 
// invokes them based on settings in this instance.
//
Router.prototype.dispatch = function (method, path, tty, callback) {
  //
  // Prepend a single space onto the path so that the traversal
  // algorithm will recognize it. This is because we always assume
  // that the `path` begins with `this.delimiter`. 
  //
  var argv = optimist(path.split(' ')).argv;
  path = ' ' + argv._.join(' ');
  var fns = this.traverse(method, path, this.routes, '');
  
  if (!fns || fns.length === 0) {
  
    if (typeof this.notfound === 'function') {
      this.invoke([this.notfound], { params: argv, tty: tty, cmd: path }, callback);
    }
    else if (callback) {
      callback(new Error('Could not find path: ' + path));
    }
    
    return false;
  }
  
  if (this.recurse === 'forward') {
    fns = fns.reverse();
  }
  
  this.invoke(fns, { params: argv, tty: tty, cmd: path }, callback);
  return true;
};
