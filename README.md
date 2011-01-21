
##What

SugarSkull is a very small client side router that provides state management. What? A route 
is a URL and a state is the active data and appearance of the application. So when the url 
changes, the router performs a given task and then the application transforms, but doesn't 
reload the page. This is especially great for making web sites feel more responsive, like desktop apps.

 - Basic glue for building single page apps.
 - Helps clarify the code path.
 - Isolates intention (designed to separate routing from application logic).
 - Code exclusion without interference.
 - Promotes code portability.

checkout a demo <a href="http://hij1nx.github.com/SugarSkull/">here</a>.
<br/>

##How

SugarSkull uses the <b>HTML5 pushState API</b> and polyfills to support older browsers.
SugarSkull keeps track of what happens to the url, if the url changes, it fires off some function(s) 
that you have specified in the configuration.

<!-- If a browser supports pushState, then the path of the URL changes, this is nice for the user
because it's very readable. If not, we divide the url into two parts. First the server-side (everything 
before the '#'), and then the client-side (everything after the '#'). The second part is called the HashRoute.
A hash route looks like this...<br/>
<img src="https://github.com/hij1nx/SugarSkull/raw/master/img/hashRoute.png" width="598" height="113" alt="HashRoute" -->

###Usage

The router takes two params...

1) A host object (optional). When it is provided, any string-literals
in the route definitions will refer to members of the host-object.<br/>
2) Configuration. An object literal made up of nested regular expressions 
that map to functions.

**Example 1: an overly simplified router**
<pre><code>
var router = SS.router({

  '/^bird/': { // the URL was either http://foo.com/bird (HTML5) or http://foo.com/index.html#bird
    on: birdFunction // fire a function that you created called 'birdFunction'
  },

  '/^dog/': {
    on: dogFunction
  },

  '/^cat/': {
    on: catFunction
  }

});
</code></pre>

**Example 2: various ways to declare functions and routes**
<pre><code>
(function() {

  return {

    Main: function() {

      var router = SS.router(this, { // this example demonstrates a host object.

        '/^dog/': {
          on: 'dogFunction'
        },

        '/^cat/': {
          on: 'catFunction'
        }

      });

    },

    dogFunction: function() {
      // woof!
    },

    catFunction: function() {
      // meow!
    }

  };

})().Main();
</code></pre>
**Example 3: a more complex configuration**
<pre><code>
var router = SS.router(someObject, {

  '/^animals\\//': {

    on: sitOnStuff, // a method defined somewhere else
    once: 'crapOnFloor', // method name called on hostobject

    '/bird[\\/]?/': {
 	    '/(\\w+)/': {
 	      on: function() {}, // perhaps an inline function?
      },
 	    on: ['f1', 'f2'], // a list of methods
      state: { type: 'bird' } // the state object associated with the route
    },

    '/dog/': {
      on: ['f1', 'f2'],
      state: { type: 'k9' }
    },

    '/cat/': {
      on: ['f1', 'f3'],
      state: { type: 'feline' }
    }
 	}
  '/^mamals\\//': {
    on: 'readDouglessAdams'
  }
    
});
</code></pre>

API
===

**SS.router(host-object, config)**<br/>
	Initial the router.<br/>
	host-object (object, optional): an object containing methods to execute.
	config (object, required): an object containing the router configuration.
<br/>

**SS.getState()**<br/>
	Returns an object that is relative to the current route.<br/>
<br/>	

**SS.setRoute(value, n, string)**<br/>
	Set the current route.<br/>
	value ()
<br/>

**SS.getRoute([index])**<br/>
	Returns an array that represents the current route.
	If an index is provided, the url (or hash depending on HTML5 pushState support)
	will be split into an array and the value at that index will be returned.
<br/>
	
**SS.getRetired()**<br/>
		Returns an array that shows which routes have been retired.
<br/>

 - On-Route. A list of functions to fire when the route is hit.
 - After-Route. A list of functions to fire when leaving a particular route.
 - Run-Once! Specify if the functions should be fired only once for a particular route.
 - Retire a whole route, view retired routes, and bring routes out of retirement.

 - After-All-Routes. A list of functions to fire when leaving a particular route.
 - On-All-Routes. A list of functions to fire when leaving a particular route.


##Version
0.2.3(b)