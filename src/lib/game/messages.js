export const injestGameMessage = function(socket, data, callback) {
  const [broadcastLabel, label] = data.label.split(':');
  let isBroadcast = broadcastLabel === 'broadcast';
  callback(label, data, isBroadcast);
};

export const sendGameMessage = function(socket, data) {
  if(!data) {
    console.log('>> Did not send, no message...');
  } else {
    socket.emit('message', {
      ...data,
      timestamp: Date.now(),
      fromSocket: socket.id
    });
  }
}