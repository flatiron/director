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

createTest('Nested route with the first child as a token, callback should yield a param', {
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

createTest('Single nested route with on member containing function value', {
  '/a': {
    '/b': {
      on: function() {
        shared.fired.push(location.hash);
      }
    }
  }
}, function() {
  shared.fired = [];
  this.navigate('/a/b', function() {
      deepEqual(shared.fired, ['#/a/b']);
      this.finish();
  });
});

createTest('Single non-nested route with on member containing function value', {
  '/a/b': {
    on: function() {
      shared.fired.push(location.hash);
    }
  }
}, function() {
  shared.fired = [];
  this.navigate('/a/b', function() {
    deepEqual(shared.fired, ['#/a/b']);
    this.finish();
  });
});

createTest('Single nested route with on member containing array of function values', {
  '/a': {
    '/b': {
      on: [function() { shared.fired.push(location.hash); },
        function() { shared.fired.push(location.hash); }]
    }
  }
}, function() {
  shared.fired = [];
  this.navigate('/a/b', function() {
      deepEqual(shared.fired, ['#/a/b', '#/a/b']);
      this.finish();
  });
});





// 
// Recursion features
// ----------------------------------------------------------

createTest('nested routes with no recursion', {
  '/a': {
    '/b': {
      '/c': {
        on: function c() {
          shared.fired.push('c');
        }
      },
      on: function b() {
        shared.fired.push('b');
      }
    },
    on: function a() {
      shared.fired.push('a');
    }
  }
}, function() {
  this.router.use({
    //recurse: 'backward'
  });

  shared.fired = [];

  this.navigate('/a/b/c', function() {
    deepEqual(shared.fired, ['c']);
    this.finish();
  });
});

createTest('nested routes with backward recursion', {
  '/a': {
    '/b': {
      '/c': {
        on: function c() {
          shared.fired.push('c');
        }
      },
      on: function b() {
        shared.fired.push('b');
      }
    },
    on: function a() {
      shared.fired.push('a');
    }
  }
}, function() {
  this.router.use({
    recurse: 'backward'
  });

  shared.fired = [];

  this.navigate('/a/b/c', function() {
    deepEqual(shared.fired, ['c', 'b', 'a']);
    this.finish();
  });
});

createTest('breaking out of nested routes with backward recursion', {
  '/a': {
    '/b': {
      '/c': {
        on: function c() {
          shared.fired.push('c');
        }
      },
      on: function b() {
        shared.fired.push('b');
        return false;
      }
    },
    on: function a() {
      shared.fired.push('a');
    }
  }
}, function() {
  this.router.use({
    recurse: 'backward'
  });

  shared.fired = [];

  this.navigate('/a/b/c', function() {
    deepEqual(shared.fired, ['c', 'b']);
    this.finish();
  });
});

createTest('nested routes with forward recursion', {
  '/a': {
    '/b': {
      '/c': {
        on: function c() {
          shared.fired.push('c');
        }
      },
      on: function b() {
        shared.fired.push('b');
      }
    },
    on: function a() {
      shared.fired.push('a');
    }
  }
}, function() {
  this.router.use({
    recurse: 'forward'
  });

  shared.fired = [];

  this.navigate('/a/b/c', function() {
    deepEqual(shared.fired, ['a', 'b', 'c']);
    this.finish();
  });
});

createTest('breaking out of nested routes with forward recursion', {
  '/a': {
    '/b': {
      '/c': {
        on: function c() {
          shared.fired.push('c');
        }
      },
      on: function b() {
        shared.fired.push('b');
        return false;
      }
    },
    on: function a() {
      shared.fired.push('a');
    }
  }
}, function() {
  this.router.use({
    recurse: 'forward'
  });

  shared.fired = [];

  this.navigate('/a/b/c', function() {
    deepEqual(shared.fired, ['a', 'b']);
    this.finish();
  });
});