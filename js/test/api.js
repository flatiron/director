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

function createTest(name, config, configure, test) {
  if (typeof configure === 'function') {
    test = configure;
    configure = undefined;
  }
  asyncTest(name, function() {
    setTimeout(function() {
      var router = new Router(config),
          context;

      if (configure !== undefined) {
        router.configure(configure);
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
