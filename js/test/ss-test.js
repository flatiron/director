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
  '/cat': {
    '/(\\w+)': function(color) {
      message = color;
    }
  },
  '/say\\/([a-z0-9-]+)\\/([a-z0-9-]+)': function(one, two) {
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

asyncTest("nested syntax", function() {
  window.location.hash = "/dog/blue";
  setTimeout(function() {
    equals(message, "blue", "color should be blue");
    start();
  }, 10);
});

//nested syntax currently either not supported or has a bug
//asyncTest("nested syntax with params", function() {
//  window.location.hash = "/cat/orange";
//  setTimeout(function() {
//    equals(message, "orange", "color should be orange");
//    start();
//  }, 10);
//});

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

asyncTest("special event - once", function() {
  window.testOnce = function() {
    equals(onceCount, 1, "count should have only been increased one time");
  };
  window.location.hash = "/onceonly";
  setTimeout(function() {
    equals(onceCount, 1, "count should have only been increased one time");
    start();
    window.location.hash = "";
    window.location.hash = "/onceonly";
    setTimeout(function() {
      equals(onceCount, 1, "count should have only been increased one time");
    }, 10);
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




