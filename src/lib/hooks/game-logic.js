import { browser } from '$app/environment';

function log(label, socketId, allData) {
  console.log(
    ` === ${label} - ${socketId} ===\n`,
    allData, '\n'
  );
}

// SERVER INJEST
export default function(io) {
  if(browser) { return; }

  // GAME MESSAGES
  io.on('connect', socket => {
    socket.on('message', data => {
      log(data.label, socket.id, data);
      switch(data.label) {
        case 'game_connection':
        case 'player_sync':
          // handle connection
          // broadcast the move out
          let parsedUserData = JSON.parse(data.user);
          socket.broadcast.emit('message', {
            ...data,
            user: parsedUserData,
            label: 'broadcast:player_joined',
          });
        break;
        case 'select_move':
          socket.broadcast.emit('message', {
            ...data,
            label: `broadcast:move_selected`
          });
        break;
        case 'start_game':
        case 'sync_game':
          case 'reveal_moves':
          socket.broadcast.emit('message', {
            ...data,
            label: `broadcast:${data.label}`
          });
        break;
        default:
          console.log('UNHANDLED:\n', socket.id, data);
      }
    });
    socket.on('disconnect', data => {
      // log('disconnect', socket.id);
    });
  });
}