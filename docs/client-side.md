# Using Director on the Client-Side 

## Overview 

* [Events](#events)
* [Special Events](#special-events)
* [Resouces](#resources)
* [Maintaining State](#maintaining-state)
* [Instance Methods](#instance-methods)

<a name="events"></a>
## Events

### Events on each route<br/>

`on` - A function or array of functions to execute when the route is matched.<br/>
`after` - A function or array of functions to execute when leaving a particular route.<br/>
`once` - A function or array of functions to execute only once for a particular route.<br/><br/>

### Events on all routes<br/>

`on` - A function or array of functions to execute when any route is matched.<br/>
`after` - A function or array of functions to execute when leaving any route.<br/>

<a name="special-events"></a>
## Special Events

In some cases a listener should only fire once or only after the user leaves the route. See the API section for more events and details about what events are available.

``` js

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

<a name="resources"></a>
### Resources

An object literal containing functions. If a host object is specified, your route definitions can provide string literals that represent the function names inside the host object. A host object can provide the means for better encapsulation and design.

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

<a name="maintaining-state"></a>
## Maintaining State

It is possible to attach state to any segment of the router, so in our case above if `/dog` is reached, the current state will be set to `{ needy: true, fetch: 'possibly' }`. Each nested section will merge into and overwrite the current state. So in the case where the router matches `/cat/hungry`, the state will become `{ needy: true, fetch: 'unlikely', frantic: true }`.

``` js

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

<a name="instance-methods"></a>
## Instance Methods

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
