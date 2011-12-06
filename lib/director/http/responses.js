//
// HTTP Error objectst
//
var util = require('util');

exports.NotModified = function () {
  this.status = 304;
  this.options = { 
    removeContentHeaders: true
  };  
};

util.inherits(exports.NotModified, Error);

exports.BadRequest = function (msg) {
  this.status = 400;
  this.headers = {};
  this.body = { error: msg };
};

util.inherits(exports.BadRequest, Error);

exports.NotAuthorized = function (msg) {
  this.status = 401;
  this.headers = {};
  this.body = { error: msg || 'Not Authorized' };
};

util.inherits(exports.NotAuthorized, Error);

exports.Forbidden = function (msg) {
  this.status = 403;
  this.headers = {};
  this.body = { error: msg || 'Not Authorized' };
};

util.inherits(exports.Forbidden, Error);

exports.NotFound = function (msg) {
  this.status = 404;
  this.headers = {};
  this.body = { error: msg };
};

util.inherits(exports.NotFound, Error);

exports.MethodNotAllowed = function (allowed) {
  this.status = 405;
  this.headers = { allow: allowed };
  this.body = { error: "method not allowed." };
};

util.inherits(exports.MethodNotAllowed, Error);

exports.NotAcceptable = function (accept) {
  this.status = 406;
  this.headers = {};
  this.body = {
    error: "cannot generate '" + accept + "' response",
    only: "application/json"
  };
};

util.inherits(exports.NotAcceptable, Error);

exports.NotImplemented = function (msg) {
  this.status = 501;
  this.headers = {};
  this.body = { error: msg };
};

util.inherits(exports.NotImplemented, Error);
