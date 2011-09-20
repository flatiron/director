//reset these each test
var activity;

//create the router
var router = new Router();

//setup/takedown
module("SS.js", {
  setup: function() {
    window.location.hash = "";
    activity = 0;;
  },
  teardown: function() {
    window.location.hash = "";
  }
});


asyncTest("adhoc routing", function() {

  // 

  router.path('/a', function() {

    // the bennifit of calling `this.route` as opposed to `this.get` or `this.post` is that
    // you can continue to define the route structure (ad-hoc) and then assign units of logic
    // per event type, there will be less repetition of definition, and the code will be more 
    // readable/centralized.

    this.path('/b', {
      on: function() {},
      after: function() {}
      before: function() {}
    });

  });

  window.location.hash = "/a";

});
