var board = [
  '', '', '',
  '', '', '',
  '', '', ''
];

var state = 0;
var socket = io();
var player = -1;

function establishConnection() {
  socket.on('connect', function() {
    console.log('Socket connection established');
    socket.on('newUser', function(players) {
      if(!players.one) {
        player = 0;
        socket.emit('playerOneConnected');
      } else if(!players.two && player !== 0) {
        player = 1;
        socket.emit('playerTwoConnected');
      }
    });
  });
}

function colorBoard(board) {
  for(let i in board) {
    if(board[i] === 0) $(`#cell-${i}`).css('background', '#f00');
    else if(board[i] === 1) $(`#cell-${i}`).css('background', '#00f');
  }
}

function clearBoard(board) {
  for(let i in board) $(`#cell-${i}`).css('background', '#000');
}

$(() => {
  establishConnection();
  colorBoard(board);

  socket.on('updateBoards', function(update) {
    console.log('board updated', update.board);
    board = update.board;
    state = update.state;
    colorBoard(update.board);
  });

  var response;

  for(let i = 0; i < 9; i++) {
    $(`#cell-${i}`).on('click', () => {
      if(board[i] === '' && player === state) {
        board[i] = state === 0 ? 0 : 1;
        state = state === 0 ? 1 : 0;
        (state === 0) ? $(`#cell-${i}`).css('background', '#00f') : $(`#cell-${i}`).css('background', '#f00');
        response = {
          index: i
        }
        response.value = state === 0 ? 1 : 0;
        socket.emit('newMove', response);
      }
      console.log(board);
    })
  }
})