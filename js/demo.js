
(function() {

  function selectContext(tabSelector, contentSelector) {

	  $(contentSelector).show();
	  $(tabSelector).addClass('selected');
  }
  
  function notFound() {
    
    // A function to get fired when a route can not be found.
    $('#route-name').text(window.location.href);
    $('#notfound').fadeIn().delay(4000).fadeOut();
  }
  
  var router;
  
	return {

		Main: function() {

      // The router method takes two parameters. The first is a 'hostObject' (optional), a reference to an object 
      // that contains the some or all of the methods that you would like to execute at run-time. Using this param
      // makes 'this' the hostObject for all functions. The second parameter is the route configuration.

			router = SS.router(this, {

				'/^about/': { // a RegExp
				  
          name: 'about',
					on: ['about'],
					state: { visited: false }

				},

				'/^how/': { // ([a-zA-Z0-9_\-]+)

     	    '/(\\w+)/': {
     	      on: ['changecolor']
          },
					on: ['how']
				},

				'/^why/': {
					on: ['why']
				},
				
				'/^demo/?([a-zA-Z0-9_\-]+)?/': {
					on: ['demo']
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
				  on: ['beforeall']
				},
				
				afterall: {
				  on: ['afterall']
				},				
				
        leaveall: {
          on: ['leaveall']
        }

			});

		},

		/* here are some functions that the router will call... */

		about: function() {
		  selectContext('#tab1', '#about');
		},

		how: function() {
		  selectContext('#tab2', '#how');
		},

		why: function() {
		  selectContext('#tab3', '#why');
		},

		demo: function() {
		  selectContext('#tab4', '#demo');
		},

    changecolor: function() {
      var bgcolor = router.getRoute(1);
      $("#colorChangeTarget").css("color", bgcolor);
    },

		beforeall: function() {
      $(".router-context").hide();
      $(".tab").removeClass("selected");
		},

		afterall: function() {},
    leaveall: function() {}
    
  }

})().Main();
