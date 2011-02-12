
##What

SugarSkull is an event emitter. It monitors the URL. When the URL changes, and it is a match to one defined in your router, it's associated functions are executed. Simple.

<b>What can this do for your app?</b>

 - Simple glue for building single page apps.
 - Promotes code portability. 
 - Isolates intention (designed to separate routing from application logic).
 - Helps clarify the code path. 
 - Code exclusion without interference.
 
<b>Compared to Sammy.js and Backbone.js</b>

 - SugarSkull is declarative so it promotes the centralization of your router design.
 - Sammy.js is jQuery dependent, modeled after a server side technology.
 - Backbone has limited support for routing, sugar-skull is complementary.

checkout a demo <a href="http://hij1nx.github.com/SugarSkull/">here</a>.
<br/>

##How

SugarSkull uses the <b>HTML5 pushState API</b> and polyfills to support older browsers by using the url hash value.

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
    on: fly // fire a function that you created called 'birdFunction'
  },

  '/^dog/': {
    on: bark
  },

  '/^cat/': {
    on: scratch
  }

});
</code></pre>

**Example 2: alternate ways to design routers**
<pre><code>
(function() {

  return {

    Main: function() {

      var router = SS.router(this, { // this example demonstrates a host object.

        '/^dog/': {
          on: ['bark', 'eat']
        },

        '/^cat/': {
          on: ['meow', 'eat']
        }

      });

    },

    bark: function() {
      // woof!
    },

    meow: function() {
      // mrrrow!
    },
    
    eat: function() {
      // yum!
    }

  };

})().Main();
</code></pre>
**Example 3: a more complex router**
<pre><code>
  
function walk() {};
function swim() {};
function talk() {};
function species() { return SS.getRoute(2); };
  
var router = SS.router(someObject, {

  '/^animal\\//': {

    on: walk,
    once: bar,

    '/bird[\\/]?/': {
 	    '/(\\w+)/': {
 	      on: species
      },
 	    on: [eat, talk], 
      state: { type: 'airborne' }
    },

    '/fish/': {
      on: [eat, swim],
      state: { type: 'amphibias' }
    }
    
 	},
 	
  '/^person\\//': {
    on: [walk, talk, eat],
    state: { type: '' }
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