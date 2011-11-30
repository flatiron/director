/*
 * insert-test.js: Tests for inserting routes into a normalized routing table. 
 *
 * (C) 2011, Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    director = require('../../../lib/director');
    
vows.describe('director/router/http/insert').addBatch({
  "An instance of director.Router": {
    topic: new director.http.Router(),
    "the path() method": {
      "/resource": {
        "should insert nested routes correct": function (router) {
          function getResource() {}
          function modifyResource() {}
          
          router.path(/\/resource/, function () {
            this.get(getResource);
            
            this.put(/\/update/, modifyResource);
            this.post(/create/, modifyResource);
          });
          
          assert.equal(router.routes.resource.get, getResource);
          assert.equal(router.routes.resource.update.put, modifyResource);
          assert.equal(router.routes.resource.create.post, modifyResource);
        }
      }
    }
  }
}).export(module);