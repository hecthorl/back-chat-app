require("dotenv").config();

// Require the framework
const Fastify = require("fastify");
const cors = require("fastify-cors");
const socketsIO = require("fastify-socket.io");
// const mongoDB = require('fastify-mongodb')

// Instantiate Fastify with some config
const app = Fastify({
   logger: true,
   pluginTimeout: 10000,
});

const config = {
   origin: ["https://front-chat-app.vercel.app/", "http://localhost:3000"],
   methods: ["GET", "PUT", "POST"],
};

// Register your application as a normal plugin.
app.register(cors, config);
app.register(socketsIO, {
   cors: {
      origin: ["https://front-chat-app.vercel.app/", "http://localhost:3000"],
      methods: ["GET", "PUT", "POST"],
   },
});
app.register(require("./app.js"));

app.ready().then(() => {
   app.io.on("connection", socket => {
      console.log(socket.id);
   });
});

app.listen(process.env.PORT || 4000, "0.0.0.0", err => {
   if (err) {
      app.log.error(err);
      process.exit(1);
   }
});
