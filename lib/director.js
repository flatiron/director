

exports.Router  = require('./director/router').Router;
exports.methods = require('./director/methods');

//
// Remark: This could be cleaner.
//
exports.Router.prototype.extend.call(exports.Router.prototype, exports.methods);