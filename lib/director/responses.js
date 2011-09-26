//
// HTTP Error objectst
//

exports.NotModified = function () {
  this.status = 304;
  this.options = { 
    removeContentHeaders: true
  };  
};

exports.BadRequest = function (msg) {
  this.status = 400;
  this.headers = {};
  this.body = { error: msg };
};

exports.NotAuthorized = function (msg) {
  this.status = 401;
  this.headers = {};
  this.body = { error: msg || 'Not Authorized' };
};

exports.Forbidden = function (msg) {
  this.status = 403;
  this.headers = {};
  this.body = { error: msg || 'Not Authorized' };
};

exports.NotFound = function (msg) {
  this.status = 404;
  this.headers = {};
  this.body = { error: msg };
};

exports.MethodNotAllowed = function (allowed) {
  this.status = 405;
  this.headers = { allow: allowed };
  this.body = { error: "method not allowed." };
};

exports.NotAcceptable = function (accept) {
  this.status = 406;
  this.headers = {};
  this.body = {
    error: "cannot generate '" + accept + "' response",
    only: "application/json"
  };
};

exports.NotImplemented = function (msg) {
  this.status = 501;
  this.headers = {};
  this.body = { error: msg };
};