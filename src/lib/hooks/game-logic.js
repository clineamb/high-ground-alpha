import { browser } from '$app/environment';

function log(label, socketId, allData) {
  console.log(
    ` === ${label} - ${socketId} ===\n`,
    allData, '\n'
  );
}

// main injest
export default function(io) {
  if(browser) { return; }

  // GAME MESSAGES
  io.on('connect', socket => {
    socket.on('message', data => {
      log(data.message, socket.id, data);
      switch(data.message) {
        case 'game_connection':
          socket.broadcast.emit('message', {
            ...data,
            message: 'broadcast:game_connection',
            newSocketId: socket.id,
          });
          break;
        case 'select_move':
          socket.broadcast.emit('message', {
            ...data,
            message: 'broadcast:select_move',
            newSocketId: socket.id,
          });
          break;
        default:
          console.log('UNHANDLED:\n', socket.id, data);
      }
    });
    socket.on('disconnect', data => {
      log('disconnect', socket.id);
    });
  });
}