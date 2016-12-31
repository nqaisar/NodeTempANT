var config = require('../config.json'),
    store = require('../store'),
    routerMap = {
      // always use lower case!
        'status': statusCounts, // http://127.0.0.1:3000/api/status
        'justfunc': justaFunc, // http://127.0.0.1:3000/api/justfun
        'anotherfunc': justaFunc // http://127.0.0.1:3000/api/justfun
    };

exports.get = function (req, res, next) {
    var target = req.params.target,        
      route = routerMap[target];
      console.log("api.js target:" + target);
  
  if (route) {
        console.log("api.js route:"+ route);
        res.send(route(req, res));
        console.log("api.js route:" + route);
  } else {
        res.send(404);
  }
};

exports.AppstatusCounts = statusCounts;
exports.justfun = justaFunc;


function justaFunc(req, res, next) {
    var ctime = req.param('CurrTime');
    var cdeve = req.param('Device');
    console.log("api.js req.params: curr time" + ctime);
    console.log("api.js req.params: device" + cdeve);
}

function statusCounts(req, res, next) {
  var status = {
    webStatus: {
      visits: get('app.visits', 0),
      errors: get('app.errors', 0)
    },
    ioStatus: {
      connections: {
        websocket: get('io.connection.websocket', 0),
        other: get('io.connection.other', 0),
      }, 
      errors: get('io.errors', 0)
    }
  };

  return status;
}
function get(key, def) {
  return store.get(key) || def;
}




