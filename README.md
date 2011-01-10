
What
====

SugarSkull is a SUPER tiny client side router.

A client side router provides state management. What? A route is a URL. A state is the 
active data and appearance of the application. So when the url changes, the router performs some
work and then the application mutates, but doesn't have to reload the page. This is especially 
great for making web sites feel more responsive, like desktop apps.

checkout a demo <a href="http://hij1nx.github.com/SugarSkull/">here</a>.

How
===

SugarSkull uses <b>HTML5 pushState</b> and falls back to older techniques to 
support all browsers. More specifically...

We divide the url into two parts. First the server-side (everything before the '#'), and then
the client-side (everything after the '#'). The second part is called the HashRoute.
The hash route looks like this...
<img src="https://github.com/hij1nx/SugarSkull/raw/master/img/hashRoute.png" width="598" height="113" alt="HashRoute">
<br/>
Sugarskull keeps track of what happens to the url, if it changes, we fire off some function(s) that you have specified.

SugarSkull applies itself to an object literal and...

**Easy client-side routing!**

 - Uses HTML5 but falls back to other techniques to support older browsers.
 - Bookmarking support.

 - On-Route. A list of functions to fire when the route is hit.
 - After-Route. A list of functions to fire when leaving a particular route.
 - Run-Once! Specify if the functions should be fired only once.

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