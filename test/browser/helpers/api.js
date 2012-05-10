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

  var innerTimeout = 0;
  if (HTML5TEST) {
    if (use === undefined) {
      use = {};
    }
    use.html5history = true;
    innerTimeout     = 500; // Because of the use of setTimeout when defining onpopstate
  }

  asyncTest(name, function() {
    setTimeout(function() {
      var router = new Router(config),
          context;

      if (use !== undefined) {
        router.configure(use);
      }

      router.init();

      setTimeout(function() {
        test.call(context = {
          router: router,
          navigate: function(url, callback) {
            if (HTML5TEST) {
              router.setRoute(url);
            } else {
              window.location.hash = url;
            }
            setTimeout(function() {
              callback.call(context);
            }, 14);
          },
          finish: function() {
            router.destroy();
            start();
          }
        })
      }, innerTimeout);
    }, 14);
  });
};
