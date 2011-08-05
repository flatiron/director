var router = new Router({
    '/cool': function(){
      message = "cool";
    },
    '/say\\/([a-z0-9-]+)\\/([a-z0-9-]+)': function(one, two){
      message = "awesome";
      param1 = one;
      param2 = two;
    }
}).init();

var message;
var param1;
var param2;

//setup/takedown
module("SugarSkull.js", {
  setup: function() {
//    console.log('setup');
    window.location.hash = "";
    message = "changeme";
    param1 = "changeme";
    param2 = "changeme";
  },
  teardown: function(){
//    console.log('teardown');
    window.location.hash = "";
  }
});

asyncTest("basic match", function(){
  window.location.hash = "/cool";
  setTimeout(function(){
    start();
    equals(message, "cool", "basic route should have changed variable");
  }, 10);
});

asyncTest("regex match", function(){
  window.location.hash = "/say/hi/there";
  setTimeout(function(){
    equals(message, "awesome", "route should have changed the message variable");
      equals(param1, "hi");
      equals(param2, "there");
    start();
  }, 10);
});

//todo test on, after, and notfound



