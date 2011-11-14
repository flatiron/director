<br/>
![/director/](https://github.com/flatiron/director/raw/master/img/director.png)

# Synopsis

Director is a router. Routing is the process of determining what code to run when a URL is requested. Director works on the client and the server. Director is dependency free, on the client it does not require any other libraries (such as jquery).

# Usage

## Client-Side Hash Routing
 It simply watches the hash of the URL to determine what to do, for example:

```js
http://foo.com/#/bar
```

Client side routing (aka hash-routing) allows you to specify some information about the state of the application using the URL. So that when the user visits a specific URL, the application can be transformed accordingly. Here is a simple example:

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

You can find a browser-specific build of Director [here][0] which has all of the server code stripped away.

## Server-Side HTTP Routing

Director handles routing for HTTP requests

```js
//
// require the native http module, as well as director.
//
var http = require('http'),
    director = require('../lib/director');

//
// create some logic to be routed to.
//
function helloWorld(route) {
  this.res.writeHead(200, { 'Content-Type': 'text/plain' })
  this.res.end('hello world from (' + route + ');
}

//
// define a routing table.
//
var router = new director.http.Router({
  '/hello': helloWorld
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
// you can also do ad-hoc routing, similar to `journey` or `express`.
//
router.get('/bonjour', heloWorld);

//
// set the server to listen on port `8080`.
//
server.listen(8080);
```

## CLI Routing

Director supports Command Line Interface routing. Routes for cli options are based on command line input instead of a url, based on the output of [optimist](https://github.com/substack/node-optimist).

```
  // TO-DO: Example required.
```

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

```javascript

  var router = Router({ // given the route '/dog/yella'.

    '/dog': {
      '/:color': {
        on: function(color) { console.log(color) } // this function will return the value 'yella'.
      }
    }

  }).init();

```

Routes can sometimes become very complex, `simple/:tokens` don't always suffice. Director supports regular expressions inside the route names. The values captured from the regular expressions are passed to your listener function.

```javascript

  var router = Router({ // given the route '/hello/world'.

    '/hello': {
      '/(\\w+)': {
        on: function(who) { console.log(who) } // this function will return the value 'world'.
      }
    }

  }).init();

```

```javascript

  var router = Router({ // given the route '/hello/world/johny/appleseed'.

    '/hello': {
      '/world/?([^\/]*)\/([^\/]*)/?': function(a, b) {
        console.log(a, b);
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
      after: function() { /* ... */ }
    }

  }).configure({ 
    
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

  var router = Router(routes).configure({ recurse: 'forward' }).init();

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

  var router = Router(routes).configure({ recurse: 'backward' }).init();

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

  var router = Router(routes).configure({ recurse: 'backward' }).init();

```


### resource
An object literal containing functions. If a host object is specified, your route definitions can provide string literals that represent the function names inside the host object. A host object can provide the means for better encapsulation and design.

```javascript

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


# Frequently Asked Questions

## What About SEO?

Is using a client side router a problem for SEO? Yes. If advertising is a requirement, you are probably building a "Web Page" and not a "Web Application". Director on the client is meant for script-heavy Web Applications.

## Is Director compatible with X?

Director is known to be Ender.js compatible. However, the project still needs solid cross-browser testing.

# Licence

(The MIT License)

Copyright (c) 2010 Nodejitsu Inc. <http://www.twitter.com/nodejitsu>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[0]: http://github.com/hij1nx/director

