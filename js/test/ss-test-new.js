
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

createTest('Nested route with the several regular expressions, callback should yield a param', {
  '/a': {
    '/(\\w+)': {
      '/(\\w+)': function(a, b) {
        shared.fired.push(a, b);
      }
    }
  }
}, function() {
  shared.fired = [];
  this.navigate('/a/b/c', function() {
    deepEqual(shared.fired, ['b', 'c']);
    this.finish();
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
        shared.fired++;
      }
    }
  }
}, function() {
  shared.fired = 0;
  this.navigate('/a/b', function() {
    this.navigate('/a/b', function() {
      this.navigate('/a/b', function() {
        deepEqual(shared.fired, 1);
        this.finish();
      });
    });
  });
});

createTest('method should only fire once on the route, multiple nesting.', {
  '/a': {
    on: function() { shared.fired++; },
    once: function() { shared.fired++; }
  },
  '/b': {
    on: function() { shared.fired++; },
    once: function() { shared.fired++; }
  }
}, function() {
  shared.fired = 0;
  this.navigate('/a', function() {
    this.navigate('/b', function() {
      this.navigate('/a', function() {
        this.navigate('/b', function() {
          deepEqual(shared.fired, 6);
          this.finish();
        });
      });
    });
  });
});

createTest('overlapping routes with tokens.', {
  '/a/:b/c' : function(){
    shared.fired.push(location.hash);
  },
  '/a/:b/c/:d' : function(){
    shared.fired.push(location.hash);
  }
}, function() {
  shared.fired = [];
  this.navigate('/a/b/c', function() {
    this.navigate('/a/b/c/d', function() {
      deepEqual(shared.fired, ['#/a/b/c', '#/a/b/c/d']);
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
}, {
  recurse: 'backward'
}, function() {
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
}, {
  recurse: 'backward'
}, function() {
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
}, {
  recurse: 'forward'
}, function() {
  shared.fired = [];

  this.navigate('/a/b/c', function() {
    deepEqual(shared.fired, ['a', 'b', 'c']);
    this.finish();
  });
});

createTest('Nested routes with forward recursion, single route with an after event.', {
  '/a': {
    '/b': {
      '/c': {
        on: function c() {
          shared.fired.push('c');
        },
        after: function() {
          shared.fired.push('c-after');
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
}, {
  recurse: 'forward'
}, function() {
  shared.fired = [];

  this.navigate('/a/b/c', function() {
    this.navigate('/a/b', function() {
      deepEqual(shared.fired, ['a', 'b', 'c', 'c-after', 'a', 'b']);
      this.finish();
    });
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
}, {
  recurse: 'forward'
}, function() {
  shared.fired = [];

  this.navigate('/a/b/c', function() {
    deepEqual(shared.fired, ['a', 'b']);
    this.finish();
  });
});

// 
// Special Events
// ----------------------------------------------------------

createTest('All global event should fire after every route', {
  '/a': {
    on: function a() {
      shared.fired.push('a');
    }
  },
  '/b': {
    '/c': {
      on: function a() {
        shared.fired.push('a');
      }
    }
  },
  '/d': {
    '/:e': {
      on: function a() {
        shared.fired.push('a');
      }
    }
  }
}, {
  after: function() {
    shared.fired.push('b');
  }
}, function() {
  shared.fired = [];

  this.navigate('/a', function() {
    this.navigate('/b/c', function() {
      this.navigate('/d/e', function() {
        deepEqual(shared.fired, ['a', 'b', 'a', 'b', 'a', 'b']);
        this.finish();
      });
    });
  });

});

createTest('Not found.', {
  '/a': {
    on: function a() {
      shared.fired.push('a');
    }
  },
  '/b': {
    on: function a() {
      shared.fired.push('b');
    }
  }
}, {
  notfound: function() {
    shared.fired.push('notfound');
  }
}, function() {
  shared.fired = [];

  this.navigate('/c', function() {
    this.navigate('/d', function() {
      deepEqual(shared.fired, ['notfound', 'notfound']);
      this.finish();
    });
  });
});

createTest('On all.', {
  '/a': {
    on: function a() {
      shared.fired.push('a');
    }
  },
  '/b': {
    on: function a() {
      shared.fired.push('b');
    }
  }
}, {
  on: function() {
    shared.fired.push('c');
  }
}, function() {
  shared.fired = [];

  this.navigate('/a', function() {
    this.navigate('/b', function() {
      deepEqual(shared.fired, ['a', 'c', 'b', 'c']);
      this.finish();
    });
  });
});


createTest('After all.', {
  '/a': {
    on: function a() {
      shared.fired.push('a');
    }
  },
  '/b': {
    on: function a() {
      shared.fired.push('b');
    }
  }
}, {
  after: function() {
    shared.fired.push('c');
  }
}, function() {
  shared.fired = [];

  this.navigate('/a', function() {
    this.navigate('/b', function() {
      deepEqual(shared.fired, ['a', 'c', 'b', 'c']);
      this.finish();
    });
  });
});

createTest('resource object.', {
  '/a': {
    '/b/:c': {
      on: 'f1'
    },
    on: 'f2'
  },
  '/d': { 
    on: ['f1', 'f2']
  }
},
{
  resource: {
    f1: function (name){
        shared.fired.push("f1-" + name);
    },
    f2: function (name){
        shared.fired.push("f2");
    }
  }
}, function() {
  shared.fired = [];

  this.navigate('/a/b/c', function() {
    this.navigate('/d', function() {
      deepEqual(shared.fired, ['f1-c', 'f1-undefined', 'f2']);
      this.finish();
    });
  });
});

createTest('argument matching should be case agnostic', {
  '/fooBar/:name': {
      on: function(name) {
        shared.fired.push("fooBar-" + name);
      }
    }
}, function() {
  shared.fired = [];
  this.navigate('/fooBar/tesTing', function() {
    deepEqual(shared.fired, ['fooBar-tesTing']);
    this.finish();
  });
});



