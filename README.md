
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

Configuration is done through an object literal
<pre><code>
var router = SS.router(this, {

	'about': {
		on: ['about']
	},

	'how': { 
		on: ['how']
	},

	'why': {
		on: ['why']
	},

	'demo/?([a-zA-Z0-9_\-]+)?': {
		on: ['demo']
	},

	// there are a few optional methods for convenience, they 

	notfound: {

		// you can define a function anywhere and refer to it here with its function name or you
		// can specify a string that represents a function name which belongs to the hostObject
		// (the object that is specified as the first parameter of the router). No other methods are
		// fired if this the route is 'not found'.

		on: [notFound] 
	},

	beforeall: {
		on: ['beforeall']
	},

	afterall: {
		on: ['afterall']
	},				

	leaveall: {
		on: ['leaveall']
	}

});
</code></pre>

**Easy client-side routing!**

 - Uses HTML5 pushState but falls back to other techniques to support older browsers.
 - Bookmarking support.

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