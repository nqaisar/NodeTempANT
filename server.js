process.env['DEBUG'] = 'server:*';
var config = require('./config.json'),
    debug = {
        io: require('debug')('server:io'),
        app: require('debug')('server:app'),
        server: require('debug')('server:server'),
        config: require('debug')('server:config'),
        error: require('debug')('server:error'),
        mong: require('debug')('server:mongoose')
    },
        
    http = require('http'),
    express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    util = require('util'),
    bodyParser = require('body-parser'),
    socketio = require('socket.io'),
    socketioWildcard = require('socket.io-wildcard'),
    server, io,
    
    //server = http.createServer(app),
    //io = socketio.listen(server),
    models = require('./models'),
    webApi = require('./routes/api'),
    hrms = require('./routes/hrms'),
    footpod = require('./routes/footpod'),
    temp = require('./routes/temp'),
    users = require('./routes/user'),
    store = require('./store'); // cheap key-value stand-in for redis

// Splash Info
debug.config('');
debug.config('\t  <<ANT+ HEALTH CARE>>');
debug.config('\t<Mongo NodeJS socket.io Server>');
debug.config('\t Mongo       : v%s', mongoose.version);
debug.config('\t Nodejs      : v%s', process.version);
debug.config('\t socket.io   : v%s', socketio.version);
debug.config('');


// *******************************
// Configure Express
// *******************************
app.configure('development', function () { // only in development
  app.use(logErrors);
});

app.configure(function () {
  app.use(express.favicon());
  app.use(bodyParser.json());
  //app.use(express.bodyParser());
  app.use(express.compress());
  app.use(express.methodOverride());
  app.use(errorHandler);
  app.use('/scripts', express.static('scripts'));
  app.use('/content', express.static('content'));
  app.use('/app', express.static('app'));
  
    
  // basic usage logging
  app.use(function (req, res, next) {
    // console.log('%s %s', req.method, req.url);
    if (req.url.indexOf('/api') === 0) {
       store.incr('app.apiCount');
      }
    else
    if (req.url.indexOf('/hrms') === 0) {
        store.incr('app.hrmCount');
      }
    else
    if (req.url.indexOf('/footpod') === 0) {
          store.incr('app.footpodCount');
    }
    else
    if (req.url.indexOf('/temp') === 0) {
          store.incr('app.tempCount');
    }
    //watchBcast('log', { level: 5, zone: 'app', eventCode: 'request', message: 'url', data: { 'method': req.method, 'url': req.url, 'count': cnt } });
    next();
  });
  
});
// General Handlers
app.get('/api/:target', webApi.get);
app.get('/hrms/:target', hrms.get);
app.get('/footpod/:target', footpod.get);
app.get('/temp/:target', temp.get);
app.get('/user/:target', users.get);



app.get('/config', function (req, res) {
    res.send(config.clientConfiguration);
});
app.get('/', function (req, res) {
    store.incr('app.visits');
    res.sendfile(__dirname + '/index.html');
    watchBcastAnalytics();
});


//var expmongose = require('express-mongoose'); It is not required here.
// database connection
//mongoose.set('debug', true);
var constring = config.confmongo.mongodser 
              + config.confmongo.port 
              + config.confmongo.mongodb;

mongoose.connect(constring, function (err) {
    if (err) throw err;
    debug.mong(constring);
    debug.mong('connected');
});


server = http.createServer(app).listen(config.web.port, function () {
    debug.app('     running at ' + config.web.hostserver + config.web.port);
});

//io = socketio.listen(server);
io = socketioWildcard(socketio).listen(server, function (err) {
    if (err) throw err;
    //bebug.io('Application is now listening');// on'+ config.web.hostserver + config.web.port);
    // *******************************
    // Configure socket.io
    // *******************************
    io.enable('browser client minification');  // send minified client
    io.enable('browser client etag');          // apply etag caching logic based on version number
    io.enable('browser client gzip');          // gzip the file
    io.set('log level', 1);                    // reduce logging: 0-error, 1-warn, 2-info, 3-debug
    io.set('transports', ['websocket', 'xhr-polling', 'jsonp-polling', 'htmlfile']);
});

/*io.set('authorization', function (handshakeData, accept) {
    if (handshakeData.headers.cookie) {
        handshakeData.cookie = cookie.parse(handshakeData.headers.cookie);
        handshakeData.sessionID = util.parseSignedCookie(handshakeData.cookie['express.sid'], 'secret');
        if (handshakeData.cookie['express.sid'] == handshakeData.sessionID) {
            return accept('Cookie is invalid.', false);
        }
    } else {
        return accept('No cookie transmitted.', false);
    }
    accept(null, true);
});*/

// *******************************
// socket.io handlers
// *******************************
io.sockets.on('connection', function (socket) { // initial connection from a client
  var transport = io.transports[socket.id].name,
      key = transport === 'websocket' ? 'websocket' : 'other';
  
  store.incr('io.connection.' + key);
  //debug.io("handshake " + socket.name);
  debug.io('client connection: %s', transport);
  watchBcastAnalytics();
  watchBcast('log', { zone: 'io', eventCode: 'connection', message: 'connection' }); // bcast connection count to 'watch' room
  watchBcast('log', { zone: 'server', eventCode: 'api', message: webApi.AppstatusCounts() });

  socket.on('*', function onWildcard(event) {
      watchBcast('log', { zone: 'io', eventCode: event.name || '?', message: util.inspect(event) });
  });
  socket.on('message', function (data) {
      watchBcast('log', { zone: 'client', eventCode: 'message', message: data });
  });
  socket.on('echo', function (message) {
    socket.emit('echo', message);
  });  
  socket.on('clientBroadcast', function (message) {
    var combinedMsg;
    try {
      if (message.room) {
        combinedMsg = [message.room, message.event];
        socket.broadcast.to(message.room).emit(message.event, message.data); //emit to 'room' except this socket
      } else {
        combinedMsg = [message.event];
        socket.broadcast.emit(message.event, message.data); //emit to all sockets except this one
      }
      //watchBcast('log', { zone: 'clientBroadcast', eventCode: combinedMsg, message: message.data });
    } catch (err) {
        debug.io('clientBroadcast error', message, err);
      store.incr('io.errors');
      watchBcastAnalytics();
    }
  });
  // client request to join 'room' data.room by name
  socket.on('subscribe', function(event) {
        socket.join(event.room);
        if (event.room === 'watch') {
            socket.emit('analytics', webApi.AppstatusCounts());
        }
    });
    
    socket.on('register', function (payload) {
        users.newuser(payload);        
    });
    socket.on('login', function (payload) {
        users.loginuser(payload);
    });
  // client request to leave 'room' data.room by name
  socket.on('unsubscribe', function (event)
  { socket.leave(event.room); });
  socket.on('disconnect', function () { // client-server connection is closed
    store.decr('io.connection.' + key);
    watchBcastAnalytics();
    watchBcast('log', { zone: 'io', eventCode: 'disconnect', message: 'client' });
  });

  socket.on('heartbeatMin', function (payload) {
        //debug.io('heartbeat minutes-node server');      
        hrms.hrmmins(payload);
    });
  socket.on('heartbeatHr', function (payload) {
        //debug.io('heartbeat hours-node server');
        hrms.hrmhours(payload);
    });
  socket.on('footpodMin', function (payload) {
        //debug.io('footpod mins-node server');
        footpod.footpodmins(payload);
    });
    socket.on('footpodHr', function (payload) {
        //debug.io('footpod hrs-node server');
        footpod.footpodhrs(payload);
    });
    socket.on('tempMin', function (payload) {
        //debug.io('temperature mins-node server');        
        //console.log("..Temp( currTemp:" + args.TempCurr +"  min24:" + args.TempMinimum + " max24:" + args.TempMax + " \n starttime:" + args.StartTime + "  CurrentTime:" + args.CurrTime +"  EventCount:" + args.EventCount + "\n )");
        temp.tempmins(payload);
    });
    socket.on('tempHr', function (payload) {
        //debug.io('temperature hours-node server');
        temp.temphrs(payload);
    });

    /*socket.on('newsARY', function (payload) {
        //debug.io('temperature hours-node server');
        console.log(payload);
    });
    socket.emit('newsPTV', { hello: 'world Special News' });*/
});

// *******************************
// Error Logging / broadcast helpers
// *******************************
function watchBcast(event, data) {
  try {
    data.dateTime = new Date(Date.now());
    io.sockets.in('watch').emit(event, data);
    //debug.io(util.inspect(data));
  } catch(err) {
      debug.error('watchBcast error: %s', err);
    store.incr('io.errors');
  }
}

function watchBcastAnalytics() {
    watchBcast('analytics', webApi.AppstatusCounts());
}

function logErrors(err, req, res, next) {
  store.incr('app:errors');
  var status = err.statusCode || 500;
  debug.io(status + ' ' + (err.message ? err.message : err));
  if (err.stack) {
      debug.error(err.stack);
  }
  //watchBcastAnalytics();
  next(err);
}

function errorHandler(err, req, res, next) {
  var status = err.statusCode || 500;
  if (err.message) {
    res.send(status, err.message);
  } else {
    res.send(status, err);
  }
  //watchBcastAnalytics();
}

process.on('uncaughtException', function (err) {
  // handle the error safely
    debug.error(err);
  //store.incr('app:errors');
  //watchBcastAnalytics();
});