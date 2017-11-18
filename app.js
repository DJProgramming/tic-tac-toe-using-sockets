var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const ejsLayouts = require('express-ejs-layouts');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(ejsLayouts);

app.get('/', (req, res) => {
  res.render('index');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const port = process.env.PORT || 3000;

const server = require('http').createServer(app);

var serverBoard = [
  '', '', '',
  '', '', '',
  '', '', ''
];

var turn = 0;

var players = {
  one: false,
  two: false
}

server.listen(port, () => {
  console.log('Server listening on port', port);

  const io = require('socket.io')(server);
  let stream;

  io.on('connect', socket => {
    console.log('A client has connected');

    socket.broadcast.emit('newUser', players);
    socket.emit('newUser', players);

    socket.on('playerOneConnected', () => {
      console.log('Player 1 Connected');
      players.one = true;
      console.log(players);
    });

    socket.on('playerTwoConnected', () => {
      console.log('Player 2 Connected');
      players.two = true;
      console.log(players);
    });

    socket.on('newMove', response => {
      turn = response.value === 1 ? 0 : 1;
      serverBoard[response.index] = response.value;
      console.log('Server:', serverBoard);
      var update = { board: serverBoard, state: turn };
      socket.broadcast.emit('updateBoards', update);
      socket.emit('updateBoards', update);
    });
  });
});

module.exports = app;
