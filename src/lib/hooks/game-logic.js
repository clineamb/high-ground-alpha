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
    socket.on('message', message => {
      log(message.label, socket.id, message);
      switch(message.label) {
        case '#game_connection':
          // handle connection
          
          break;
        case 'select_move':
          socket.broadcast.emit('message', {
            ...messsage,
            label: 'broadcast:select_move',
            newSocketId: socket.id,
          });
          break;
        default:
          console.log('UNHANDLED:\n', socket.id, message);
      }
    });
    socket.on('disconnect', data => {
      // log('disconnect', socket.id);
    });
  });
}