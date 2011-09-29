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

  router.path('/a', function() {

    this.path('/b', {
      on: function() {},
      after: function() {}
      before: function() {}
    });

  });

  window.location.hash = "/a";

});
