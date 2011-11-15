module("Director.js", {
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

function createTest(name, config, use, test) {
  if (typeof use === 'function') {
    test = use;
    use = undefined;
  }
  asyncTest(name, function() {
    setTimeout(function() {
      var router = new Router(config),
          context;

      if (use !== undefined) {
        router.configure(use);
      }

      router.init();

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
    }, 14);
  });
};
