if (process.env.NODE_ENV !== "production") {
   require("dotenv").config();
}
const Fastify = require("fastify");
const cors = require("fastify-cors");
const socketsIO = require("fastify-socket.io");
const mongoDB = require("fastify-mongodb");

// Instantiate Fastify with some config
const app = Fastify({
   logger: true,
   pluginTimeout: 10000,
});

const corsConfig = {
   origin: ["https://front-chat-app.vercel.app/", "http://localhost:3000"],
   methods: ["GET", "PUT", "POST", "DELETE", "PATCH"],
};

app.register(cors, corsConfig);
app.register(socketsIO, { cors: corsConfig });
app.register(mongoDB, { url: process.env.MONGODB_URI });
app.register(require("./app.js"));

app.ready().then(() => {
   app.io.on("connection", socket => {
      socket.on("join_channel", data => {
         socket.join(data.room);
         socket.emit("join_channel", data);
      });

      socket.on("new message", data => {
         socket.to(data.room).emit("msg recibido", data);
      });
   });
});

app.listen(process.env.PORT || 5000, "0.0.0.0", err => {
   if (err) {
      app.log.error(err);
      process.exit(1);
   }
});
