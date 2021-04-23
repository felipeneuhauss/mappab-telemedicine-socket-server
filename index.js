const app = require('express')()
const http = require('http').createServer(app)
const cors = require('cors')
app.use(cors())
const socketOptions = {
  cors: {
    credentials: false,
    origin: ['*', 'http://localhost:3000'],
    methods: ['GET', 'POST']
  }
}
console.log('SocketOptions:', socketOptions)
const io = require('socket.io')(http, socketOptions)

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>')
})
const port = process.env.PORT || 9000
http.listen(port, () => {
  console.log('listening on *:', port)
})

io.on('connection', (socket) => {
  socket.on('join-room', (userData) => {
    const {roomId, userId} = userData
    console.log(roomId, userId)
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userData)
    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userData)
    })
  })

  socket.on('medical-screening', (appointment) => {
    console.log('medical-screening-appointment', appointment)
    socket.broadcast.emit('new-medical-screening', appointment);
  })
  socket.on('urgency-appointment', (appointment) => {
    console.log('urgency-appointment-appointment', appointment)
    socket.broadcast.emit('new-urgency-appointment', appointment);
  })
})
