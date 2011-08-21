
$(function() {

  var routes1 = {

    '/motivation': {
      on: function() {}
    },
    '/anatomy': {
      on: function() {}
    },
    '/project': {
      on: function() {}
    },

  };
  
  router1 = Router(routes1).use({
    on: showSections
  });

  router1.init();

  function showSections() {

    // this is a simple method to hide and show sections based on the route,
    // obviously this is an overly simplified example for this purpose of this demo.

    $('section').hide();

    var mainSections = 'section[data-route-0="' + router1.getRoute(0) + '"]';
    var subSections = 'section[data-route-1="' + router1.getRoute(1) + '"]';

    $(mainSections).show();
    $(mainSections + ' ' + subSections).show();
  }

});
