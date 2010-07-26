var APP = (typeof APP != "undefined") ? APP : {

    overrides: {},

    override: function(ns, plan) {
        overrides[ns] = plan;
    },

    exec: function(params) {

        var strNS = params.ns
            ,self = this
            ,ns = {}
            ,sectors = strNS.split('.')
            ,methods
            ,isArray = (function() { return Array.isArray || function(obj) {
                return !!(obj && obj.concat && obj.unshift && !obj.callee);
            }})();

        var i = 0
            ,len = sectors.length;

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
        eval(params.ns + " = this;"); // TODO: there may be a better way to do this assignment.

        methods = (typeof APP.overrides[ns] == "undefined") ?
            params.plan : APP.overrides[ns];

        for(method in methods) {

            if(isArray(methods[method])) {

                var params = methods[method].slice(1, methods[method].length)
                    ,i=params.length
                    ,sync = false;

                for(; i>0; i--) {
                    if(params[i] === "sync") {
                        sync = true;
                    }
                }

                sync ? self[methods[method][0]].call(self, params) :
                    (function(method) {
                        setTimeout(function() {
                            self[method[0]].call(self, method.slice(1, method.length));
                        }, 1);
                    })(methods[method]);
            }
            else {

                (function(method) {
                    setTimeout(function() {
                        self[method].call(self);
                    }, 1);
                })(methods[method])
            }
        }
    }
};