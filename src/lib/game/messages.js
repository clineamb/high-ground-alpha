// page app game

export const injestGameMessage = function(socket, message) {
  console.log('>> gameMessages >>', message);
};

export const sendGameMessage = function(socket, message) {
  socket.emit('message', {
    ...message,
    fromSockId: socket.id,
    timestamp: Date.now(),
  });
}