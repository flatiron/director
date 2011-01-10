
(function() {

  // NOTE! All of the following methods use pure javascript. jQuery could do a lot of this 
  // in much fewer lines of code, but i wanted to package these examples without jQuery.
  // 

  function selectContext(tabSelector, contentSelector) {
    
    // A function to show certain things when a route is entered.
    
	  document.querySelectorAll(contentSelector)[0].style.display = "block";
	  document.querySelectorAll(tabSelector)[0].className = "tab selected";
  }
  
  function notFound() {
    
    // A function to get fired when a route can not be found.
    
    document.querySelectorAll('#route-name')[0].innerHTML = window.location.hash;
	  
    var el = document.querySelectorAll('#notfound')[0];
    el.style.display = "block";
    
    setTimeout(function() {
      el.style.display = "none";
    }, 5000);    
    
  }
  
  var router;
  
	return {

		Main: function() {

      // The router method takes two parameters. The first is a 'hostObject' (optional), a reference to an object 
      // that contains the some or all of the methods that you would like to execute at run-time. Using this param
      // makes 'this' the hostObject for all functions. The second parameter is the route configuration.

			router = SS.router(this, {

				"#about": { // a RegExp

					on: ["about"],
					state: { visited: false }

				},

				"#how": { // ([a-zA-Z0-9_\-]+)
					on: ["how"]
				},

				"#why": {
					on: ["why"]
				},
				
				"#demoExplanation": {
					on: ["demo"]
				},				

        // there are a few optional methods for convenience, they 

				notfound: {

				  // you can define a function anywhere and refer to it here with its function name or you
				  // can specify a string that represents a function name which belongs to the hostObject
				  // (the object that is specified as the first parameter of the router). No other methods are
				  // fired if this the route is 'not found'.

					on: [notFound] 
				},

				beforeall: {
				  on: ["beforeall"]
				},
				
				afterall: {
				  on: ["afterall"]
				},				
				
        leaveall: {
          on: ["leaveall"]
        }

			});

		},

		/* implementations... */

		about: function() {
		  selectContext("#tab1", "#about");
		},

		how: function() {
		  selectContext("#tab2", "#how");
		},

		why: function() {
		  selectContext("#tab3", "#why");
		},
		
		demo: function() {
		  selectContext("#tab4", "#demoExplanation");
		},		
		
		beforeall: function() {
    
      // this just finds all the elements with the 'router-context' class and hides them.
      
      var contexts = document.querySelectorAll(".router-context");
      
      for (var i=0; i < contexts.length; i++) {
        contexts[i].style.display = "none";
      }
      
      // this removes the 'selected' class from demo tabs.
      
      var tabs = document.querySelectorAll(".tab");
      
      for (var i=0; i < contexts.length; i++) {
        tabs[i].className = "tab";
      }
      
		},
		
		afterall: function() {},
    leaveall: function() {}
  }

})().Main();
