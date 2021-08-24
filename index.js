const app = require('express')()
const http = require('http').createServer(app)
const socketOptions = {
  cors: {
    credentials: false,
    origin: '*',
  }
}
const io = require('socket.io')(http, socketOptions)

const users = {};
const socketToRoom = {};

app.get('/', (_, res) => {
  res.send('<h1>Socket Server</h1>')
})

const port = process.env.PORT || 9000

http.listen(port, () => {
  console.log('listening on *:', port)
})

io.on('connection', (socket) => {
  socket.on('join-room', (roomID) => {
    console.log('join-room - roomID', roomID)
    if (users[roomID]) {
      const length = users[roomID].length;
      
      if (length === 2) {
          socket.emit("room full");
          return;
      }

      users[roomID].push(socket.id);
    } else {
        users[roomID] = [socket.id];
    }

    socketToRoom[socket.id] = roomID;
    const usersInThisRoom = users[roomID].filter(id => id !== socket.id);

    socket.emit("all users", usersInThisRoom);
  })

  socket.on("sending signal", ({ userToSignal, signal, callerID }) => {
    console.log('sending signal - userToSignal', userToSignal)
    console.log('sending signal - signal', signal)
    console.log('sending signal - callerID', callerID)
    io.to(userToSignal).emit('user joined', { signal, callerID })
  });

  socket.on("returning signal", ({ signal, callerID }) => {
    console.log('returning signal - signal', signal)
    console.log('returning signal - callerID', callerID)
    io.to(callerID).emit('receiving returned signal', { signal, id: socket.id });
  });

  socket.on('disconnect', () => {
    console.log('room-disconnect')
    const roomID = socketToRoom[socket.id];
    
    let room = users[roomID] || [];
    if (room) {
        room = room.filter(id => id !== socket.id);
        users[roomID] = room;
    }

    room.forEach(user => {
        socket.broadcast.to(user).emit('user disconnected', socket.id)
    })
  });

  socket.on('medical-screening', (appointment) => {
    console.log('medical-screening-appointment', appointment)
    socket.broadcast.emit('new-medical-screening', appointment);
  })
  socket.on('urgency-appointment', (appointment) => {
    console.log('urgency-appointment', appointment)
    socket.broadcast.emit('new-urgency-appointment', appointment);
  })
})
