const app = require('express')()
const cors = require('cors')
app.use(cors())
const http = require('http').createServer(app)
const io = require('socket.io')(http, {
  cors: {
    origin: '*',      
    credentials: false
  }
})

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>')
})
const port = process.env.PORT || 9000
http.listen(port, () => {
  console.log('listening on *:', port)
})

io.on('connection', (socket) => {
  console.log('socket established')
  socket.on('join-room', (userData) => {
      const { roomID, userID } = userData;
      console.log(roomID, userID)
      socket.join(roomID);
      socket.to(roomID).broadcast.emit('user-connected', userData);
      socket.on('disconnect', () => {
          socket.to(roomID).broadcast.emit('user-disconnected', userID);
      });
      socket.on('broadcast-message', (message) => {
          socket.to(roomID).broadcast.emit('new-broadcast-messsage', {...message, userData});
      });
      // socket.on('reconnect-user', () => {
      //     socket.to(roomID).broadcast.emit('new-user-connect', userData);
      // });
      socket.on('display-media', (value) => {
          socket.to(roomID).broadcast.emit('display-media', {userID, value });
      });
      socket.on('user-video-off', (value) => {
          socket.to(roomID).broadcast.emit('user-video-off', value);
      });
  });
})
