var http = require('http'),
    sugarskull = require('../lib/sugarskull');

var router = new sugarskull.http.Router();

var server = http.createServer(function (req, res) {
  router.dispatch(req, res, function (err) {
    if (err) {
      res.writeHead(404);
      res.end();
    }
  });
});

router.get(/foo/, function () {
  this.res.writeHead(200, { 'Content-Type': 'text/plain' })
  this.res.end('hello world\n');
});

server.listen(8080);
console.log('vanilla http server with sugarskull running on 8080');
