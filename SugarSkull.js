
// --- LIBRARY CODE ----------------------------------------------

var SugarSkull = (typeof SugarSkull != "undefined") ? SugarSkull : {
	App: { ExecutivePlan: {}, NamespaceManager: {} }
};

SugarSkull.App.ExecutiveDelegation = function(params) {
	var namespace = params.namespace;
	
	if(window[params.author] == "undefined") {
		window[params.author || "SugarSkull"] = SugarSkull;
	}

	if(typeof window[params.author].App.NamespaceManager[namespace] == "undefined") {
		window[params.author].App.NamespaceManager[namespace] = {};
	}
	else {
		alert("fatal development error occured, namespace collision: " + params.namespace);
		return;
	}

	var self = this;
	var methods = (typeof window[params.author].App.ExecutivePlan[namespace] == "undefined") ? 
		params.executivePlan : window[params.author].App.ExecutivePlan[namespace];

	$.each(methods, function(i, method) {

		if(Object.prototype.toString.call(method) == "[object Array]") {
			self[method[0]].apply(self, method.slice(1, method.length));
		}
		else {
			self[method].apply(self);			
		}
	});

	delete this.Main;
	return (window[params.author].App[namespace] = this);
};


// --- APPLICATION CODE ----------------------------------------------


$(function(){

	 (function() {

		/* private */

			/* code... */

		/* public */ return {

			Main: function() { /* the main entry point for the program, is fired automatically. */

				return SugarSkull.App.ExecutiveDelegation.call(this, { /* some sugar to take care of namespacing, execution-context and code orginization. */

					author: "myGlobalNamespace",
					namespace: "nsOne", /* the namespace that this code structure should be stored in. */

					executivePlan: [ /* functions from this structure that are to be executed. */

						"UnitOne"
						,"UnitTwo"
						,"UnitThree"
					]

				});

			},

			UnitOne: function() {
				/* code... */
			},
			
			UnitTwo: function() {
				/* code... */
			},
			
			UnitThree: function() {
				/* code... */
			}					
			
			
		}
	})().Main();
});
