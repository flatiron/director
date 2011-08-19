//reset these each test
var message;
var param1;
var param2;

//don't reset these
var specialMessage;
var all;
var notfound;
var onceCount = 0;

//create the router
var router = new Router({
  '/cool': function() {
    message = "cool";
  },
  '/dog': {
    '/blue': {
      on: function() {
        message = "blue";
      }
    }
  },
  '/article/:id': function(id){
    message = "Cool Article";
    param1 = id;
  },
  '/article/:season/:year': function(season, year){
    param1 = season;
    param2 = year;
  },
  '/cat': {
    '/(\\w+)': {
      '/(\\w+)': function(color, size){
        message = color + " and " + size
      },
      on: function(color) {
        message = color;
      }
    }
  },
  '/say\\/(\\w+)\\/(\\w+)': function(one, two) {
    message = "awesome";
    param1 = one;
    param2 = two;
  },
  '/special': {
    on: function() {
      specialMessage = "you are";
    },
    after: function() {
      specialMessage += " special";
      testAfter();
    }
  },
  '/other/nested': {
    '/test': function() {
      message = "success";
    }
  },
  '/onceonly': {
    once: function() {
      onceCount++;
    }
  }
}).use({
  on: function(value) {
    all = "hola";
  },
  after: function(value) {
  },
  notfound: function(value) {
    notfound = "404";
  }}).init();

//setup/takedown
module("SugarSkull.js", {
  setup: function() {
    window.location.hash = "";
    message = "changeme";
    param1 = "changeme";
    param2 = "changeme";
  },
  teardown: function() {
    window.location.hash = "";
  }
});

asyncTest("basic match", function() {
  window.location.hash = "/cool";
  setTimeout(function() {
    start();
    equals(message, "cool", "basic route should have changed variable");
  }, 10);
});

asyncTest("regex match", function() {
  window.location.hash = "/say/hi/there";
  setTimeout(function() {
    equals(message, "awesome", "route should have changed the message variable");
    equals(param1, "hi");
    equals(param2, "there");
    start();
  }, 10);
});

asyncTest("simple tokens", function(){
  window.location.hash = "/article/22";
  setTimeout(function(){
    equals(message, "Cool Article", "simple param should have found match");
    equals(param1, 22, "param1 should have been set by the function");
    start();
  }, 10);
});

asyncTest("multiple simple tokens", function(){
  window.location.hash = "/article/summer-time/2011";
  setTimeout(function(){
    equals(param1, "summer-time", "param1 should have been set by the function");
    equals(param2, "2011", "param2 should have been set by the function");
    start();
  }, 10);
});

asyncTest("nested syntax", function() {
  window.location.hash = "/dog/blue";
  setTimeout(function() {
    equals(message, "blue", "color should be blue");
    start();
  }, 10);
});

asyncTest("mixed nested syntax", function() {
  window.location.hash = "/other/nested/test";
  setTimeout(function() {
    equals(message, "success", "should be success");
    start();
  }, 10);
});

asyncTest("nested syntax with params", function() {
  window.location.hash = "/cat/orange";
  setTimeout(function() {
    equals(message, "orange", "color should be orange");
    start();
  }, 10);
});

asyncTest("nested syntax with multiple params", function() {
  window.location.hash = "/cat/purple/small";
  setTimeout(function() {
    equals(message, "purple and small", "color and size params should have been passed");
    start();
  }, 10);
});

//todo test nested syntax with simple token
//todo test nested syntax with multiple simple tokens

asyncTest("special event - after", function() {
  //run the test after
  window.testAfter = function() {
    equals(specialMessage, "you are special", "'after' should have been called after 'on'");
  };
  window.location.hash = "/special";
  setTimeout(function() {
    start();
  }, 10);
});

asyncTest("special event - on (for the entire router)", function() {
  window.location.hash = "/cat/orange";
  setTimeout(function() {
    equals(all, "hola", "value should be changed");
    start();
  }, 10);
});

asyncTest("special event - notfound (for the entire router)", function() {
  window.location.hash = "/goodluckwiththis";
  setTimeout(function() {
    equals(notfound, "404", "value should be changed");
    start();
    stop();
  }, 10);
});

//todo test recurse
//todo test state
//todo to url params (?option=open&section=2)



