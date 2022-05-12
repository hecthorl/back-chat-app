if (process.env.NODE_ENV !== 'production') {
   require('dotenv').config()
}
const Fastify = require('fastify')
const fastifyCors = require('fastify-cors')
const socketsIO = require('fastify-socket.io')
const mongoDB = require('fastify-mongodb')
const helmet = require('fastify-helmet')
const updateChat = require('./utils/updateChat.js')

// Instantiate Fastify with some config
const app = Fastify({ logger: { level: 'error' } })
const cors = {
   origin: ['https://front-chat-app.vercel.app', 'http://localhost:3000'],
   methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH'],
   preflightContinue: false,
}
app.register(helmet)
app.register(fastifyCors, cors)
app.register(socketsIO, { cors })
app.register(mongoDB, { url: process.env.MONGODB_URI })
app.register(require('./app.js'))

// States
const users = {}
const socketToRoom = {}

app.ready()
   .then(({ io, mongo }) => {
      const RoomsCollection = mongo.db.collection('rooms')

      io.on('connection', socket => {
         // console.log(socket.handshake);
         socket.on('join_channel', roomId => {
            socket.join(roomId)
            socket.emit('join_channel', roomId)
         })

         socket.on('new message', async data => {
            socket.to(data.roomId).emit('message_in', data)

            const { opt, query, updateDoc } = updateChat(data.roomId, data)
            // TODO: majear exepción
            await RoomsCollection.updateOne(query, updateDoc, opt)
         })
         // Esto funciona pero no es lo que quiero...
         socket.emit('me', socket.id)
         // socket.on("disconnect", () => {
         //    socket.broadcast.emit("callended");
         // });
         socket.on('calluser', data => {
            console.log(data, 'en calluser')
            const ojt = {
               signal: data.signalData,
               ...data,
            }
            socket.to(data.userToCall).emit('calluser', ojt)
         })
         socket.on('ansercall', data => {
            socket.to(data.to).emit('callaccepted', data.signal)
         })

         //VideoChat secc
         socket.on('join_videoroom', roomId => {
            if (users[roomId]) {
               const length = users[roomId].length
               if (length === 4) {
                  socket.emit('room full')
                  return
               }
               users[roomId].push(socket.id)
            } else {
               users[roomId] = [socket.id]
            }

            socketToRoom[socket.id] = roomId
            const usersInThisRoom = users[roomId].filter(id => id !== socket.id)

            socket.emit('all users', usersInThisRoom)
         })
         socket.on('sending signal', payload => {
            socket.to(payload.userToSignal).emit('user joined', {
               signal: payload.signal,
               callerID: payload.callerID,
            })
         })

         socket.on('returning signal', payload => {
            socket.to(payload.callerID).emit('receiving returned signal', {
               signal: payload.signal,
               id: socket.id,
            })
         })

         socket.on('disconnect', () => {
            const roomID = socketToRoom[socket.id]
            let room = users[roomID]
            if (room) {
               room = room.filter(id => id !== socket.id)
               users[roomID] = room
            }
         })
      })
   })
   .catch(err => {
      app.log.error(err)
      process.exit(1)
   })

const { PORT = 5000 } = process.env

app.listen(PORT, '0.0.0.0', err => {
   if (err) {
      app.log.error(err)
      process.exit(1)
   }
   console.log('server status: on', PORT)
})
