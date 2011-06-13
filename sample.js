
var router1, router2;



$(function() {


  var routes1 = {

    '/foo': function() { console.log('x') }
    
    // '/a': {
    //      '/(.*)?': { on: function word(a) { console.log('/a/regex (' + a + ')'); } },
    //      on: function aOn() { console.log('/a'); },
    //      state: { a: true }
    //    },
    // 
    //    '/c': function c() { console.dir(router1.getState()); },
    // 
    //    '/d': {
    //      on: function d() { console.log('/d'); },
    //      '/a': {
    //        '/b': {
    //          on: ['booroute']
    //        }
    //      }
    //      //after: function dafter() { console.log('/d-after') }
    //    },
    // 
    //    '/boo': 'booroute',
    //    '/foo': ['fooroute1', 'fooroute2']
  };
  
  router1 = Router(routes1)

  router1.init();

 // router2 = Router(routes2);
  
  
  
});


/*
var routes1 = {

  '/a': {
    '/(.*)?': { on: function word(a) { console.log('/a/regex (' + a + ')'); } },
    on: function aOn() { console.log('/a'); },
    state: { a: true }
  },
  
  '/b': {
    '/a': function a() { console.log('/b/a'); },
    once: function b() { console.log('/b'); }
  },
  
  '/c': function c() { console.dir(router1.getState()); },
  
  '/d': {
    on: function d() { console.log('/d'); },
    '/a': {
      '/b': {
        on: ['booroute']
      }
    }
    //after: function dafter() { console.log('/d-after') }
  },

  '/boo': 'booroute',
  '/foo': ['fooroute1', 'fooroute2']
};

var routes2 = {
  '/e': {
    '/(.*)?': { on: function word(a) { console.log('/e/regex (' + a + ')'); } },
    on: function eOn() { console.log('/e'); }
  },
  '/f': [function f1() { console.log('/f-1'); }, function f2() { console.log('/f-2'); }]
};

var container1 = {
  'fooroute1': function() { console.log('fooroute1'); },
  'fooroute2': function() { console.log('fooroute2'); },
  'booroute': function() { console.log('booroute'); }
};

window.onload = function() {

  router1 = Router(routes1);
  router2 = Router(routes2);

  router1.use({ // extras...
    resource: container1,
    notfound: function(routename) { console.log('not found: ' + routename)} 
    //recurse: 'forward', // 'backward'
    //on: [function on1() {console.log('oneach1');}, function on2() {console.log('oneach2');}]
    //after: [function after1() {console.log('aftereach1');}, function after2() {console.log('aftereach2');}]
    //on: function(a) { console.log('oneach: ' + a); }
    //after: function() { console.log('aftereach'); }

  }).init();

  router2.init();

};
*/