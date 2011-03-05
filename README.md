![Alt text](https://github.com/hij1nx/RSAN/raw/master/img/sugarskull.png)<br/>

## What?

SugarSkull is a client side URL router. It's the smallest amount of glue needed for building dynamic single page applications. 

## Why?

The HTML5 history API is NOT a replacement for using location.hash. It does not cater to a single-page apps. In fact, it is designed around the requirement that all pages should load without the ability to leverage Javascript. This is unfortunate for script-rich applications who's audience is well known. The HTML5 history API requires the URL to resolve to real assets on the server, and therefore can not be used as a superfluous state management mechanism. That's where SugarSkull comes in.

Why not <i>backbone.js</i>? Backbone.js has limited support for this and covers a minute set of the cases for client side routing. What about <i>sammy.js</i>? Sammy.js is a jquery plugin that tries to emulate server side routing which introduces unnecessary concepts.

## How?

SugarSkull monitors the URL. When the URL changes, and it is a match to one defined in your router table, the functions that are associated with that route are executed. You could almost think of the URL as an event emitter. checkout a demo of it working right <a href="http://hij1nx.github.com/SugarSkull/">here</a>.

More specifically the way this works is that we divide the url into two parts. First the server-side (everything 
before the '#'), and then the client-side (everything after the '#'). The second part is the HashRoute.
A hash route looks like this...<br/><br/>
<img src="https://github.com/hij1nx/SugarSkull/raw/master/img/hashRoute.png" width="598" height="113" alt="HashRoute" -->

## Usage

First, the router constructor accepts an object literal that will serve as the routing table. Optionally, it can also accept a second object literal that contains functions. The second option is useful when the functions to be called get defined or loaded after the router gets defined.

### A trivial demonstration

    var router = SS.router({

      '/dog': {
        on: bark
      },

      '/cat': {
        on: meow
      }

    });

In the above code, the object literal contains a set of key/value pairs. The keys represent each potential part of the URL. The values contain instructions about what to do when there is an actual match. `bark` and `meow` are two functions that you have defined in your code.

### More complex URLs

    var router = SS.router({

      '/dog': {
        '/angry': {
          on: growl
        }
        on: bark
      },

      '/cat': {
        '/saton': {
          on: freakout
        }
        on: meow
      }

    });
    
Above we have a case where the URL's are prepared to be more complex. As you can see, nesting the key/value pairs will achieve this.

### The arrangement of logic

    var router = SS.router({

      '/dog': {
        '/angry': {
          on: [growl, freakout]
        }
        on: bark
      },

      '/cat': {
        '/squish': {
          on: freakout
        }
        on: meow
      }

    });

Above we have a case where both `/dog/angry` and `cat/squsih` will execute `freakout`. Hence the `on` property will support an array which can execute many functions when there is a URL match.

### Special Cases

    var router = SS.router({

      '/dog': {
        '/angry': {
          on: 'growl',
          once: 'zap'
        }
        on: bark
      },

      '/cat': {
        '/saton': {
          on: 'freakout'
        }
        on: meow
      }

    });
    
In some cases, you may want to fire a function once. For instance a signin or advertisement is a good use case. In addition to the `on` property there is a `once` property for this purpose.



### Alternate ways to design routers
<pre><code>
(function() {

  return {

    Main: function() {

      var router = SS.router(this, { // this example demonstrates a host object.

        '/dog': {
          on: ['bark', 'eat'], // eat and bark.
          '/fat': {
            on: ['eat'] // eat a second time!
          }
        },

        '/cat': {
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
### Example 3: a more complex router
<pre><code>
  
function walk() {};
function swim() {};
function talk() {};
function species() { return SS.getRoute(2); };
  
var router = SS.router(someObject, {

  '/animal': {

    on: walk,
    once: bar,

    '/bird': {
 	    '/(\\w+)': {
 	      on: species
      },
 	    on: [eat, talk], 
      state: { type: 'airborne' }
    },

    '/fish': {
      on: [eat, swim],
      state: { type: 'amphibias' }
    }
    
 	},
 	
  '/person': {
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

# Credits

 - Author - hij1nx
 - Contributors - Charlie Robbins

# Version
0.2.4(b)

# Licence

(The MIT License)

Copyright (c) 2010 hij1nx <http://www.twitter.com/hij1nx>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
