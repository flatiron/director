createTest('nested routes', {
  '/a/b': {
    '/c': function c() {
      shared.fired.push('abc');
    },
    on: function ab() {
      shared.fired.push('ab');
    }
  },

  '/a': {
    on: function a() {
      shared.fired.push('a');
    }
  },

  '/hello': {
    '/world': {
      on: function world(a) {
        shared.fired.push('hello world');
      }
    }
  },

  '/d/:id': function did(a) {
    shared.fired.push('d:id');
  },

  '/e': {
    '/:id': function(a) {
      shared.fired.push('e:id');
    }
  },

  '/f': {
    '/:id': {
      '/:id': function(a, b) {
        shared.fired.push('f:id:id');
      }
    }
  }
}, function() {
  this.router.use({
    recurse: 'backward'
  });

  shared.fired = [];

  this.navigate('/a/b/c', function() {
    deepEqual(shared.fired, ['abc', 'ab']);
    this.finish();
  });
});

createTest('Route param', {
  '/foo': {
    '/:id': {
      on: function() {
        shared.fired.push(location.hash);
      }
    }
  }
}, function() {
  shared.fired = [];
  this.navigate('/foo/a', function() {
    this.navigate('/foo/b/c', function() {
      deepEqual(shared.fired, ['#/foo/a']);
      this.finish();
    });
  });
});
