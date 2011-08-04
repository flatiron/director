//setup/takedown
module("SugarSkull.js", {
  setup: function() {
    window.location.hash = "";
  },
  teardown: function(){}
});

asyncTest("basic match", function(){
  var message = "changeme";
  var router = Router({
    '/cool': function(){
      message = "cool";
    }
  }).init();
  window.location.hash = "/cool";
  
  setTimeout(function(){
    equals(message, "cool", "basic route should have changed variable");
    start();
  }, 20);
});