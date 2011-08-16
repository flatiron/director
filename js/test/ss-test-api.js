module("SugarSkull.js", {
  setup: function() {
    window.location.hash = "";
    shared = {};
  },
  teardown: function() {
    window.location.hash = "";
    shared = {};
  }
});

var shared;

function createTest(name, config, test) {
  asyncTest(name, function() {
    var router = new Router(config).init(),
        context;

    test.call(context = {
      router: router,
      navigate: function(url, callback) {
        window.location.hash = url;
        setTimeout(function() {
          callback.call(context);
        }, 14);
      },
      finish: function() {
        router.destroy();
        start();
      }
    });
  });
};
