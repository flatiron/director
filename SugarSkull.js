var APP = (typeof APP != "undefined") ? APP : {

    overrides: {},

    override: function(ns, plan) {
        overrides[ns] = plan;
    },

    exec: function(params) {

        var strNS = params.ns;
        var ns = {};
        var sectors = strNS.split('.');

        for (var i = 0; i < sectors.length; i++) {
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

        var self = this;
        var methods = (typeof APP.overrides[ns] == "undefined") ?
            params.plan : APP.overrides[ns];

        for(method in methods) {
			try {
	            if(Object.prototype.toString.call(methods[method]) == "[object Array]") {
	                self[methods[method][0]].call(self, methods[method].slice(1, methods[method].length));
	            }
	            else {
	                self[methods[method]].call(self);
	            }
			}
			catch(ex) {
				var error = new Error();
				error.name = "No such method";
				error.message = "Execution-Plan method '"+methods[method]+"' not found.";
				throw(error);
			}
        }
    }
};