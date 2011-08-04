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

asyncTest("regex match", function(){
  var message = "changeme";
  var router = Router({
    '/initiative\\/([a-z0-9-]+)\\/([a-z0-9-]+)': function(one, two){
      message = "awesome";
      equals(one, "hi");
      equals(two, "there");
    }
  }).init();
  window.location.hash = "/initiative/hi/there";

  setTimeout(function(){
    equals(message, "awesome", "basic route should have changed variable");
    start();
  }, 20);
});

//todo test on, after, and notfound



