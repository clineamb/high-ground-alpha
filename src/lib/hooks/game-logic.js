import { browser } from '$app/environment';

export default function(io) {
  if(browser) { return; }

  // GAME MESSAGES
  io.on('connect', socket => {
    socket.emit('message', {
      message: `${socket.id} - Connected to the server!`
    });
    socket.on('message', data => {
      console.log(data);
    });
  });
}