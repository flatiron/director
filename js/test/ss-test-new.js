createTest('Circus test', {
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

createTest('Nested route with the many children as a tokens, callbacks should yield historic params', {
  '/a': {
    '/:id': {
      '/:id': function(a, b) {
        shared.fired.push(location.hash, a, b);
      }
    }
  }
}, function() {
  shared.fired = [];
  this.navigate('/a/b/c', function() {
    deepEqual(shared.fired, ['#/a/b/c', 'b', 'c']);
    this.finish();
  });
});

createTest('Nested route with the first child as a token, callback should yield a param', {
  '/foo': {
    '/:id': {
      on: function(id) {
        shared.fired.push(location.hash, id);
      }
    }
  }
}, function() {
  shared.fired = [];
  this.navigate('/foo/a', function() {
    this.navigate('/foo/b/c', function() {
      deepEqual(shared.fired, ['#/foo/a', 'a']);
      this.finish();
    });
  });
});

createTest('Nested route with the first child as a regexp, callback should yield a param', {
  '/foo': {
    '/(\\w+)': {
      on: function(value) {
        shared.fired.push(location.hash, value);
      }
    }
  }
}, function() {
  shared.fired = [];
  this.navigate('/foo/a', function() {
    this.navigate('/foo/b/c', function() {
      deepEqual(shared.fired, ['#/foo/a', 'a']);
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

createTest('method should only fire once on the route.', {
  '/a': {
    '/b': {
      once: function() {
        shared.fired.push(1);
      }
    }
  }
}, function() {
  shared.fired = [];
  this.navigate('/a/b', function() {
    this.navigate('/a/b', function() {
      deepEqual(shared.fired, 1);
      this.finish();
    });
  });
});



// 
// Recursion features
// ----------------------------------------------------------

createTest('Nested routes with no recursion', {
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

createTest('Nested routes with backward recursion', {
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

createTest('Breaking out of nested routes with backward recursion', {
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

createTest('Nested routes with forward recursion', {
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

createTest('Breaking out of nested routes with forward recursion', {
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
