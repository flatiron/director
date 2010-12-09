
<img src="https://github.com/hij1nx/SugarSkull/raw/master/sugarskull.png"></img>
A little bit of sugar for the skeleton of your app...

What
====

SugarSkull is a SUPER tiny (~3.5k minified) client side router. SugarSkull is simple. It's not a jack-knife. It's meant to serve one of
two purposes; 1) very simple routing. 2) a starting point for REALLY big projects where you need a custom solution from end to end. 
If you dont know much about client-side routing, I recommend sammy.js.

How
===

SugarSkull applies itself to an object literal and...

**Applies Namespacing!**

 - SugarSkull will traverse existing objects and attach your new object literal to the namespace you specify so you dont get collisons with other objects.
	
**Easy client-side routing!**

 - On-Route. Uses the location hash to route to functions in your object literal.
 - After-Route. List functions to fire from the object literal when leaving a particular route.
 - Run-Once! Specify if the functions should be fired only once.

**SugarSkull tries to address the following issues with as few moving parts as possible...**

 - Clarification of the execution path.
 - Isolation of intention.
 - Code exclusion without interference.
 - Code portability.
