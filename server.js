if (process.env.NODE_ENV !== 'production') {
   require('dotenv').config()
}
const Fastify = require('fastify')
const fastifyCors = require('fastify-cors')
const mongoDB = require('fastify-mongodb')
const helmet = require('fastify-helmet')

// Instantiate Fastify with some config
const app = Fastify({ logger: { level: 'error' } })
const cors = {
   origin: ['https://front-chat-app.vercel.app', 'http://localhost:3000'],
   methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH'],
   preflightContinue: false,
}
app.register(helmet)
app.register(fastifyCors, cors)
app.register(mongoDB, { url: process.env.MONGODB_URI })
app.register(require('./app.js'))

const { PORT = 5000 } = process.env

app.listen(PORT, '0.0.0.0', err => {
   if (err) {
      app.log.error(err)
      process.exit(1)
   }
   console.log('server status: on', PORT)
})
