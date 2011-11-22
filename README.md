# Director [![Build Status](https://secure.travis-ci.org/flatiron/director.png)](http://travis-ci.org/flatiron/director)

# Overview
Director is a router. Routing is the process of determining what code to run when a URL is requested. Director works on the client and the server. Director is dependency free, on the client it does not require any other libraries (such as jQuery).

* [Client-Side Routing](#client-side)
* [Server-Side HTTP Routing](#http-routing)
* [Server-Side CLI Routing](#cli-routing)
* [API Documentation](#api-documentation)
* [Frequently Asked Questions](#faq)

<a name="client-side"></a>
## Client-side Routing
It simply watches the hash of the URL to determine what to do, for example:

```
http://foo.com/#/bar
```

Client-side routing (aka hash-routing) allows you to specify some information about the state of the application using the URL. So that when the user visits a specific URL, the application can be transformed accordingly. 

<img src="https://github.com/flatiron/director/raw/master/img/hashRoute.png" />

Here is a simple example:

```html
  <!html>
  <html>
    <head>
      <script src="/director.js"></script>
      <script>

        var author = function () { /* ... */ },
            books = function () { /* ... */ };

        var routes = {
          '/author': showAuthorInfo,
          '/books': [showAuthorInfo, listBooks]
        };

        var router = Router(routes);

      </script>
    </head>
    <body>
    </body>
  </html>
```

Director works great with your favorite DOM library, such as jQuery.

```html
  <!html>
  <html>
    <head>
      <script src="/director.js"></script>
      <script>

        // 
        // create some functions to be executed when
        // the correct route is issued by the user.
        //
        var author = function () { /* ... */ },
            books = function () { /* ... */ },
            allroutes = function(route) {
              var sections = $('section');
              sections.hide();
              sections.find('data-route[' + route + ']').show();
            };

        //
        // define the routing table.
        //
        var routes = {
          '/author': showAuthorInfo,
          '/books': [showAuthorInfo, listBooks]
        };

        //
        // instantiate the router.
        //
        var router = Router(routes);
      
        //
        // a global configuration setting.
        //
        router.configure({
          on: allroutes
        });

      </script>
    </head>
    <body>
      <section data-route="author">Author Name</section>
      <section data-route="books">Book1, Book2, Book3</section>
    </body>
  </html>
```

You can find a browser-specific build of `director` [here][0] which has all of the server code stripped away.

<a name="http-routing"></a>
## Server-Side HTTP Routing

Director handles routing for HTTP requests similar to `journey` or `express`: 

```js
  //
  // require the native http module, as well as director.
  //
  var http = require('http'),
      director = require('director');

  //
  // create some logic to be routed to.
  //
  function helloWorld(route) {
    this.res.writeHead(200, { 'Content-Type': 'text/plain' })
    this.res.end('hello world from (' + route + ')');
  }

  //
  // define a routing table.
  //
  var router = new director.http.Router({
    '/hello': {
      get: helloWorld
    }
  });

  //
  // stup a server and when there is a request, dispatch the
  // route that was requestd in the request object.
  //
  var server = http.createServer(function (req, res) {
    router.dispatch(req, res, function (err) {
      if (err) {
        res.writeHead(404);
        res.end();
      }
    });
  });

  //
  // You can also do ad-hoc routing, similar to `journey` or `express`.
  // This can be done with a string or a regexp.
  //
  router.get('/bonjour', helloWorld);
  router.get(/hola/, helloWorld);

  //
  // set the server to listen on port `8080`.
  //
  server.listen(8080);
```

<a name="cli-routing"></a>
## CLI Routing

Director supports Command Line Interface routing. Routes for cli options are based on command line input (i.e. `process.argv`) instead of a URL.

``` js
  var director = require('director');
  
  var router = new director.cli.Router();
  
  router.on('create', function () {
    console.log('create something');
  });
  
  router.on(/destroy/, function () {
    console.log('destroy something');
  });
```

<a name="api-documentation"></a>
# API Documentation

* [Constructor](#constructor)
* [Routing Table](#routing-table)
* [Adhoc Routing](#adhoc-routing)
* [Scoped Routing](#scoped-routing)
* [Routing Events](#routing-events)
* [Configuration](#configuration)
* [URL Matching](#url-matching)
* [URL Params](#url-params)
* [Route Recursion](#route-recursion)
* [Async Routing](#async-routing)
* [Resources](#resources)
* [Instance Methods](#instance-methods)

<a name="constructor"></a>
## Constructor

``` js
  var router = Router(routes);
```

<a name="routing-table"></a>
## Routing Table

An object literal that contains nested route definitions. A potentially nested set of key/value pairs. The keys in the object literal represent each potential part of the URL. The values in the object literal contain references to the functions that should be associated with them. *bark* and *meow* are two functions that you have defined in your code.

``` js
  //
  // Assign routes to an object literal.
  //
  var routes = { 
    //
    // a route which assigns the function `bark`.
    //
    '/dog': bark,
    //
    // a route which assigns the functions `meow` and `scratch`.
    //
    '/cat': [meow, scratch]
  };

  //
  // Instantiate the router.
  //
  var router = Router(routes); 
```

<a name="adhoc-routing"></a>
## Adhoc Routing

When developing large client-side or server-side applications it is not always possible to define routes in one location. Usually individual decoupled components register their own routes with the application router. We refer to this as _Adhoc Routing._ Lets take a look at the API `director` exposes for adhoc routing:

**Client-side Routing**

``` js
  var router = new Router().init();
  
  router.on('/some/resource', function () {
    //
    // Do something on `/#/some/resource`
    //
  });
```

**HTTP Routing**

``` js
  var router = new director.http.Router();
  
  router.get(/\/some\/resource/, function () {
    //
    // Do something on an GET to `/some/resource` 
    //
  });
```

<a name="scoped-routing"></a>
## Scoped Routing

In large web appliations, both [Client-side](#client-side) and [Server-side](#server-side), routes are often scoped within a few individual resources. Director exposes a simple way to do this for [Adhoc Routing](#adhoc-routing) scenarios:

``` js
  var router = new director.http.Router();
  
  //
  // Create routes inside the `/users` scope.
  //
  router.path(/\/users\/(\w+)/, function () {
    //
    // The `this` context of the function passed to `.path()`
    // is the Router itself.
    //
    
    this.post(function (id) {
      //
      // Create the user with the specified `id`.
      //
    });
    
    this.get(function (id) {
      //
      // Retreive the user with the specified `id`.
      //
    });
    
    this.get(/\/friends/, function (id) {
      //
      // Get the friends for the user with the specified `id`.
      //
    });
  });
```

<a name="routing-events"></a>
## Routing Events

In `director`, a "routing event" is a named property in the [Routing Table](#routing-table) which can be assigned to a function or an Array of functions to be called when a route is matched in a call to `router.dispatch()`.

* **on:** A function or Array of functions to execute when the route is matched.
* **before:** A function or Array of functions to execute before calling the `on` method(s).

**Client-side only**

* **after:** A function or Array of functions to execute when leaving a particular route.
* **once:** A function or Array of functions to execute only once for a particular route.

<a name="configuration"></a>
## Configuration

Given the flexible nature of `director` there are several options available for both the [Client-side](#client-side) and [Server-side](#server-side). These options can be set using the `.configure()` method:

``` js
  var router = new director.Router(routes).configure(options);
```

The `options` are:

* **recurse:** Controls [route recursion](#route-recursion). Use `forward`, `backward`, or `false`. Default is `false` Client-side, and `backward` Server-side. 
* **strict:** If set to `false`, then trailing slashes (or other delimiters) are allowed in routes. Default is `true`.
* **async:** Controls [async routing](#async-routing). Use `true` or `false`. Default is `false`.
* **delimiter:** Character separator between route fragments. Default is `/`.
* **notfound:** A function to call if no route is found on a call to `router.dispatch()`.
* **on:** A function (or list of functions) to call on every call to `router.dispatch()` when a route is found.
* **before:** A function (or list of functions) to call before every call to `router.dispatch()` when a route is found.

**Client-side only**

* **resource:** An object to which string-based routes will be bound. This can be especially useful for late-binding to route functions (such as async client-side requires).
* **after:** A function (or list of functions) to call when a given route is no longer the active route.

<a name="url-matching"></a>
## URL Matching

``` js
  var router = Router({
    //
    // given the route '/dog/yella'.
    //
    '/dog': {
      '/:color': {
        //
        // this function will return the value 'yella'.
        //
        on: function (color) { console.log(color) }
      }
    }
  });
```

Routes can sometimes become very complex, `simple/:tokens` don't always suffice. Director supports regular expressions inside the route names. The values captured from the regular expressions are passed to your listener function.

``` js
  var router = Router({ 
    //
    // given the route '/hello/world'.
    //
    '/hello': {
      '/(\\w+)': {
        //
        // this function will return the value 'world'.
        //
        on: function (who) { console.log(who) }
      }
    }
  });
```

``` js
  var router = Router({
    //
    // given the route '/hello/world/johny/appleseed'.
    //
    '/hello': {
      '/world/?([^\/]*)\/([^\/]*)/?': function (a, b) {
        console.log(a, b);
      }
    }
  });
```

<a name="url-params"></a>
## URL Parameters

When you are using the same route fragments it is more descriptive to define these fragments by name and then use them in your [Routing Table](#routing-table) or [Adhoc Routes](#adhoc-routing). Consider a simple example where a `userId` is used repeatedly. 

``` js
  //
  // Create a router. This could also be director.cli.Router() or 
  // director.http.Router().
  //
  var router = new director.Router();
    
  //
  // A route could be defined using the `userId` explicitly.
  //
  router.on(/([\w-_]+)/, function (userId) { });
  
  //
  // Define a shorthand for this fragment called `userId`.
  //
  router.param('userId', /([\\w\\-]+)/);
  
  //
  // Now multiple routes can be defined with the same
  // regular expression.
  //
  router.on('/anything/:userId', function (userId) { });
  router.on('/something-else/:userId', function (userId) { });
```

<a name="route-recursion"></a>
## Route Recursion

Can be assigned the value of `forward` or `backward`. The recurse option will determine the order in which to fire the listeners that are associated with your routes. If this option is NOT specified or set to null, then only the listeners associated with an exact match will be fired.

### No recursion, with the URL /dog/angry

``` js
  var routes = {
    '/dog': {
      '/angry': {
        //
        // Only this method will be fired.
        //
        on: growl
      },
      on: bark
    }
  };

  var router = Router(routes);
```

### Recursion set to `backward`, with the URL /dog/angry

``` js
  var routes = {
    '/dog': {
      '/angry': {
        //
        // This method will be fired first.
        //
        on: growl 
      },
      //
      // This method will be fired second.
      //
      on: bark
    }
  };

  var router = Router(routes).configure({ recurse: 'backward' });
```

### Recursion set to `forward`, with the URL /dog/angry

``` js
  var routes = {
    '/dog': {
      '/angry': {
        //
        // This method will be fired second.
        //
        on: growl
      },
      //
      // This method will be fired first.
      //
      on: bark
    }
  };

  var router = Router(routes).configure({ recurse: 'forward' });
```

### Breaking out of recursion, with the URL /dog/angry

``` js
  var routes = {
    '/dog': {
      '/angry': {
        //
        // This method will be fired first.
        //
        on: function() { return false; } 
      },
      //
      // This method will not be fired.
      //
      on: bark 
    }
  };
  
  //
  // This feature works in reverse with recursion set to true.
  //
  var router = Router(routes).configure({ recurse: 'backward' });
```

<a name="async-routing"></a>
## Async Routing

Before diving into how Director exposes async routing, you should understand [Route Recursion](#route-recursion). At it's core route recursion is about evaluating a series of functions gathered when traversing the [Routing Table](#routing-table). 

Normally this series of functions is evaluated synchronously. In async routing, these functions are evaluated asynchronously. Async routing can be extremely useful both on the client-side and the server-side:

* **Client-side:** To ensure an animation or other async operations (such as HTTP requests for authentication) have completed before continuing evaluation of a route.
* **Server-side:** To ensure arbitrary async operations (such as performing authentication) have completed before continuing the evaluation of a route.

The method signatures for route functions in synchronous and asynchronous evaluation are different: async route functions take an additional `next()` callback.

### Synchronous route functions

``` js
  var router = new director.Router();
  
  router.on('/:foo/:bar/:bazz', function (foo, bar, bazz) {
    //
    // Do something asynchronous with `foo`, `bar`, and `bazz`.
    //
  });
```

### Asynchronous route functions

``` js
  var router = new director.http.Router().configure({ async: true });
  
  router.on('/:foo/:bar/:bazz', function (foo, bar, bazz, next) {
    //
    // Go do something async, and determine that routing should stop
    //
    next(false);
  });
```

<a name="resources"></a>
## Resources

**Available on the Client-side only.** An object literal containing functions. If a host object is specified, your route definitions can provide string literals that represent the function names inside the host object. A host object can provide the means for better encapsulation and design.

``` js

  var router = Router({

    '/hello': {
      '/usa': 'americas',
      '/china': 'asia'
    }

  }).configure({ resource: container }).init();

  var container = {
    americas: function() { return true; },
    china: function() { return true; }
  };

```

<a name="instance-methods"></a>
## Instance methods

### configure(options)
* `options` {Object}: Options to configure this instance with.

Configures the Router instance with the specified `options`. See [Configuration](#configuration) for more documentation.

### param(token, matcher)
* token {string}: Named parameter token to set to the specified `matcher`
* matcher {string|Regexp}: Matcher for the specified `token`.

Adds a route fragment for the given string `token` to the specified regex `matcher` to this Router instance. See [URL Parameters](#url-parameters) for more documentation.

### on(method, path, route)
* `method` {string}: Method to insert within the Routing Table (e.g. `on`, `get`, etc.).
* `path` {string}: Path within the Routing Table to set the `route` to.
* `route` {function|Array}: Route handler to invoke for the `method` and `path`.

Adds the `route` handler for the specified `method` and `path` within the [Routing Table](#routing-table). 

### path(path, routesFn)
* `path` {string|Regexp}: Scope within the Routing Table to invoke the `routesFn` within.
* `routesFn` {function}: Adhoc Routing function with calls to `this.on()`, `this.get()` etc.

Invokes the `routesFn` within the scope of the specified `path` for this Router instance.

### dispatch(method, path[, callback])
* method {string}: Method to invoke handlers for within the Routing Table
* path {string}: Path within the Routing Table to match
* callback {function}: Invoked once all route handlers have been called.

Dispatches the route handlers matched within the [Routing Table](#routing-table) for this instance for the specified `method` and `path`.

### mount(routes, path)
* routes {object}: Partial routing table to insert into this instance.
* path {string|Regexp}: Path within the Routing Table to insert the `routes` into.

Inserts the partial [Routing Table](#routing-table), `routes`, into the Routing Table for this Router instance at the specified `path`.

## Instance methods (Client-side only)

### init()
Initialize the router, start listening for changes to the URL.

### getState()
Returns the state object that is relative to the current route.

### getRoute([index])
* `index` {Number}: The hash value is divided by forward slashes, each section then has an index, if this is provided, only that section of the route will be returned. 

Returns the entire route or just a section of it.

### setRoute(route)
* `route` {String}: Supply a route value, such as `home/stats`. 

Set the current route.
  
### setRoute(start, length)
* `start` {Number} - The position at which to start removing items.
* `length` {Number} - The number of items to remove from the route.

Remove a segment from the current route.

### setRoute(index, value)
* `index` {Number} - The hash value is divided by forward slashes, each section then has an index.
* `value` {String} - The new value to assign the the position indicated by the first parameter.

Set a segment of the current route.

<a name="faq"></a>
# Frequently Asked Questions

## What About SEO?

Is using a Client-side router a problem for SEO? Yes. If advertising is a requirement, you are probably building a "Web Page" and not a "Web Application". Director on the client is meant for script-heavy Web Applications.

## Is Director compatible with X?

Director is known to be Ender.js compatible. However, the project still needs solid cross-browser testing.

# Licence

(The MIT License)

Copyright (c) 2010 Nodejitsu Inc. <http://www.twitter.com/nodejitsu>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[0]: http://github.com/flatiron/director

