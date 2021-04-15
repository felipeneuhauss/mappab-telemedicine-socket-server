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
  console.log('connected')
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)
    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })

  socket.on('medical-screening', (appointment) => {
    socket.broadcast.emit('new-medical-screening', appointment);
  })
  socket.on('urgency-appointment', (appointment) => {
    socket.broadcast.emit('new-urgency-appointment', appointment);
  })
})
