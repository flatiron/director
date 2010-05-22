// --- LIBRARY CODE ----------------------------------------------

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
				ns = (ns[sector] ? ns[sector] : {});
			}
	    }

		var self = this;
		var methods = (typeof APP.overrides[ns] == "undefined") ? 
			params.plan : APP.overrides[ns];

		for(method in methods) {
			if(Object.prototype.toString.call(method) == "[object Array]") {
				self[method[0]].apply(self, method.slice(1, method.length));
			}
			else {
				self[method].apply(self);			
			}
		}

		delete this.Main;
		return (ns = this);
	}
};

// --- APPLICATION CODE ----------------------------------------------

 (function() {

	/* private */

		/* code... */

	/* public */ return {

		Main: function() { /* the main entry point for the program, is fired automatically. */

			APP.exec.call(this, {
			/* some sugar to take care of namespacing, execution-context and code orginization. */

				ns: "myNS.foobar.bazz", /* the namespace that this code structure should be stored in. */

				plan: [ /* functions from this structure that are to be executed. */

					["UnitOne", "test1"]
					,"UnitTwo"
					,"UnitThree"
				]
			});
		},

		UnitOne: function(args) {
			document.write(args[1]);
		},

		UnitTwo: function() {
			document.write(this);
		},

		UnitThree: function() {
			document.write("test3");
		}					


	}
})().Main();