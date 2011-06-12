![Alt text](https://github.com/hij1nx/SugarSkull/raw/master/img/sugarskull.png)

# Synopsis

SugarSkull is a client side URL router. It's the smallest amount of glue needed for building dynamic single page applications. Not a jquery plugin, and has no dependencies.

# Motivation

Storing some information about the state of an application within the URL allows the URL of the application to be emailed, bookmarked or copied and pasted. When the URL is visited it restores the state of the application. A client side router will also notify the browser about changes to the page, so even if the page does not reload, the back/forward buttons will give the illusion of navigation.

The HTML5 history API isn't a replacement for using the location hash. The HTML5 history API requires that a URL resolves to real assets on the server. It is also designed around the requirement that all pages *should* load without Javascript. SugarSkull targets script-rich applications who's audience is well-known.

SugarSkull can enhance ***backbone.js*** by replacing its controllers. It covers more use cases and provides a more expressive way to define routes and associate logic with them. It's a lightweight alternative to ***sammy.js***, narrowly focused on routing.

Is using a client side router a problem for SEO? Yes. If advertising is a requirement, you are probably building a "Web Page" and not a "Web Application". SugarSkull is meant for script-heavy Web Applications.

# Anatomy

SugarSkull monitors the URL. When the URL changes, and it is a match to one defined in your router table, the functions that are associated with that route are executed. You could almost think of the URL as an event emitter.

More specifically the way this works is that we divide the url into two parts. First the server-side (everything 
before the '#'), and then the client-side (everything after the '#'). The second part is the HashRoute.
A hash route looks like this...<br/><br/>
<img src="https://github.com/hij1nx/SugarSkull/raw/master/img/hashRoute.png" width="598" height="113" alt="HashRoute" -->

### Compatibility
- Ender.js Compatibile.
- Needs Cross Browser testing.


# Usage

## Constructor

```javascript

  var router = Router(routes);

```

### routes (required) 
An object literal that contains nested route definitions. A potentially nested set of key/value pairs. The keys in the object literal represent each potential part of the URL. The values in the object literal contain references to the functions that should be associated with them. *bark* and *meow* are two functions that you have defined in your code.

```javascript

  var routes = { // an object literal.

    '/dog': bark, // a route which assigns the function `bark`.
    '/cat': [meow, scratch] // a route which assigns the functions `meow` and `scratch`.
  };

  var router = Router(routes); // Instantiate the router.

```

## URL Matching

Routes can sometimes become very complex, `simple/:tokens` don't always suffice. SugarSkull supports regular expressions inside the route names. The values captured from the regular expressions are passed to your listener function.

```javascript

  var router = Router({ // given the route '/dog/yella'.

    '/dog': {
      '/(\\w+)': {
        on: function(color) { console.log(color) } // this function will return the value 'yella'.
      }
    }

  }).init();

```


## Special Events

In some cases a listener should only fire once or only after the user leaves the route. See the API section for more events and details about what events are available.

```javascript

  var router = Router({

    '/dog': {
      on: bark
    },

    '/cat': {
      on: meow
      after: function() {}
    }

    after: function() {},
    notfound: function() {}

  }).use({ 
    
    // In some cases you may want to have these events always fire
    
    on: function(value) { console.log('the previous route captured the value ' + value); }, 
    after: function(value) { console.log('the previous route captured the value ' + value); },
    
    // if you use multiple routers and define a notfound route, be cautious about multiple notfound listeners firing.
    
    notfound: function(value) { console.log('the route named ' + value + ' could not be found'); }

  }).init();

```

## More Options

### recurse

Can be assigned the value of `forward` or `backward`. The recurse option will determine the order in which to fire the listeners that are associated with your routes. If this option is NOT specified or set to null, then only the listeners associated with an exact match will be fired.

#### No recursion, with the URL /dog/angry

```javascript

  var routes = {

    '/dog': {
      '/angry': {
        on: growl // this method will be fired.
      },
      on: bark
    }
  };

  var router = Router(routes);

```

#### Recursion set to true, with the URL /dog/angry

```javascript

  var routes = {

    '/dog': {
      '/angry': {
        on: growl // this method will be fired second.
      },
      on: bark // this method will be fired first.
    }
  };

  var router = Router(routes).use({ recurse: 'forward' }).init();

```

#### Recursion set to false, with the URL /dog/angry

```javascript

  var routes = {

    '/dog': {
      '/angry': {
        on: growl // this method will be fired first.
      },
      on: bark // this method will be fired second.
    }
  };

  var router = Router(routes).use({ recurse: 'backward' }).init();

```

#### Breaking out of recursion, with the URL /dog/angry

```javascript

  var routes = {

    '/dog': {
      '/angry': {
        on: function() { return false; } // this method will be fired first.
      },
      on: bark // this method will not be fired.
    }
  };
  
  // this feature works in reverse with recursion set to true.

  var router = Router(routes).use({ recurse: 'backward' }).init();

```


### resource
An object literal containing functions. If a host object is specified, your route definitions can provide string literals that represent the function names inside the host object. A host object can provide the means for better encapsulation and design.

```javascript

  var router = Router({

    '/moola': {
      '/benny': 'hundred',
      '/sawbuck': 'five'
    }

  }).use({ resource: container }).init();

  var container = {
    hundred: function() { return 100; },
    five: function() { return 5; }
  };

```

## Maintaining State

It is possible to attach state to any segment of the router, so in our case above if `/dog` is reached, the current state will be set to `{ needy: true, fetch: 'possibly' }`. Each nested section will merge into and overwrite the current state. So in the case where the router matches `/cat/hungry`, the state will become `{ needy: true, fetch: 'unlikely', frantic: true }`.

```javascript

  var router = Router({

    '/dog': {
      on: bark,
      state: { needy: true, fetch: 'possibly' }
    },

    '/cat': {
      '/hungry': {
        state: { needy: true, frantic: true }
      },
      on: meow,
      state: { needy: false, fetch: 'unlikely' }
    }

  }).init();

```


# API

## Constructor<br/><br/>

### Router(config)<br/>
`config` {Object} - An object literal representing the router configuration.<br/>

Returns a new instance of the router.<br/><br/>

## Instance methods

### use([on, after, recurse, resource])
`on` {Function} or {Array} - A callback or list of callbacks that will fire on every route.<br/>
`after` {Function} or {Array} - A callback or list of callbacks that will fire after every route.<br/>
`recurse` {String} - Determines the order in which to fire the listeners that are associated with your routes. can be set to '*backward*' or '*forward*'.<br/>
`resource` {Object} - An object literal of function declarations.<br/>
`notfound` {Function} or {Array} - A callback or a list of callbacks to be called when there is no matching route.<br/>

Initialize the router, start listening for changes to the URL.<br/><br/>

### init()
Initialize the router, start listening for changes to the URL.<br/><br/>

### getState()
Returns the state object that is relative to the current route.<br/><br/>

### getRoute([index])
`index` {Numner} - The hash value is divided by forward slashes, each section then has an index, if this is provided, only that section of the route will be returned.<br/>

Returns the entire route or just a section of it.<br/><br/>

### setRoute(route)
`route` {String} - Supply a route value, such as `home/stats`.<br/>

Set the current route.<br/><br/>
  
### setRoute(start, length)
`start` {Number} - The position at which to start removing items.<br/>
`length` {Number} - The number of items to remove from the route.<br/>

Remove a segment from the current route.<br/><br/>

### setRoute(index, value)
`index` {Number} - The hash value is divided by forward slashes, each section then has an index.<br/>
`value` {String} - The new value to assign the the position indicated by the first parameter.<br/>

Set a segment of the current route.<br/><br/>

## Events

### Events on each route<br/>

`on` - A function or array of functions to execute when the route is matched.<br/>
`after` - A function or array of functions to execute when leaving a particular route.<br/>
`once` - A function or array of functions to execute only once for a particular route.<br/><br/>

### Events on all routes<br/>

`on` - A function or array of functions to execute when any route is matched.<br/>
`after` - A function or array of functions to execute when leaving any route.<br/>

# Version
0.3.0

# Licence

(The MIT License)

Copyright (c) 2010 hij1nx <http://www.twitter.com/hij1nx>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
