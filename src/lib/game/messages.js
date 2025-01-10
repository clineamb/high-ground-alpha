// page app game

export const injestGameMessage = function(socket, message) {
  console.log('>> gameMessages >>', message);
};

export const sendGameMessage = function(socket, message) {
  if(!message) {
    console.log('>> Did not send, no message...');
  } else {
    socket.emit('message', {
      ...message,
      timestamp: Date.now(),
    });
  }
}