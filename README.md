
What
====

SugarSkull is a VERY small client side router.

A client side router provides state management. What? A route is a URL. A state is the 
active data and appearance of the application. So when the url changes, the router performs 
a given task and then the application mutates, but doesn't have to reload the page. This is 
especially great for making web sites feel more responsive, like desktop apps.

checkout a demo <a href="http://hij1nx.github.com/SugarSkull/">here</a>.

How
===

SugarSkull uses the <b>HTML5 pushState API</b> and polyfills to support older browsers.
Sugarskull keeps track of what happens to the url, if the url changes, it fires off some function(s) 
that you have specified in the configuration.


For convenience, Sugarskull adds the ability to change the current route from an anchor tag. 
Normally, clicking on an anchor with a hash-only value will set the location hash. By adding 
the class "setRoute" to the tag, the url's path will change (but not reload the page).
<br/>
<!-- If a browser supports pushState, then the path of the URL changes, this is nice for the user
because it's very readable. If not, we divide the url into two parts. First the server-side (everything 
before the '#'), and then the client-side (everything after the '#'). The second part is called the HashRoute.
A hash route looks like this...<br/>
<img src="https://github.com/hij1nx/SugarSkull/raw/master/img/hashRoute.png" width="598" height="113" alt="HashRoute" -->
<br/>

The router takes two params, first a 'host-object' is optional. When it is provided, any string-literals
in the route definitions refer to members of the host-object.<br/><br/>

The second param is the configuration. You can also think of this as your router-design. It's an object literal 
made up of regular expressions, and a few optional helper functions. Here are a few examples.

<pre><code>
var someFunctions = {
	f1: function(name) { console.log("hello my name is " + name); },
	f2: function() { console.log("i " + (SS.getState().dangerous ? "am" : "am not") + " dangerous"); },
	f3: function() { console.log("i am well behaved."); }
};

function f4() { console.log("i will only happen once"); }

var router = SS.router(someFunctions, {

 	'/^punks\\//': {

 	  on: ['f1'],
 		once: [f4],

 	  '/johny[\\/]?/': {
 	    '/(\\w+)/': {
 	      on: [function(a) { console.log('johny ' + a); SS.getState().name = a; }],
 	    },
 	    on: ['f1', 'f2'],
      state: { dangerous: true, name: 'Johny' }
    },

    '/john/': {
      on: ['f1', 'f2'],
      state: { dangerous: false, name 'John Doe' }
    },

    '/gg/': {
      on: ['f1', 'f3'],
      state: { dangerous: true, name 'G. G. Allen' }
    }
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


**SugarSkull tries to address the following issues with as few moving parts as possible...**

 - Clarification of the execution path.
 - Isolation of intention (separates routing from implementations, allows you to organize your logic according to its purpose).
 - Code exclusion without interference.
 - Promotes code portability.

Version
=======
0.2.0(b)