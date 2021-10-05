if (process.env.NODE_ENV !== "production") {
   require("dotenv").config();
}
const Fastify = require("fastify");
const cors = require("fastify-cors");
const socketsIO = require("fastify-socket.io");
const mongoDB = require("fastify-mongodb");
const helmet = require("fastify-helmet");
const updateChat = require("./utils/updateChat.js");

// Instantiate Fastify with some config
const app = Fastify();
app.register(helmet);
app.register(cors, {
   origin: ["https://front-chat-app.vercel.app", "http://localhost:3000"],
   methods: ["GET", "PUT", "POST", "DELETE", "PATCH"],
   preflightContinue: false,
});

app.register(socketsIO, {
   cors: {
      origin: ["https://front-chat-app.vercel.app", "http://localhost:3000"],
      methods: ["GET", "PUT", "POST", "DELETE", "PATCH"],
      preflightContinue: false,
   },
});
app.register(mongoDB, { url: process.env.MONGODB_URI });
app.register(require("./app.js"));

app.ready()
   .then(({ io, mongo }) => {
      const RoomsCollection = mongo.db.collection("rooms");

      io.on("connection", socket => {
         // console.log(socket.handshake);
         socket.on("join_channel", roomId => {
            socket.join(roomId);
            socket.emit("join_channel", roomId);
         });

         socket.on("new message", async data => {
            socket.to(data.roomId).emit("message_in", data);

            const { opt, query, updateDoc } = updateChat(data.roomId, data);
            // TODO: majear exepción
            await RoomsCollection.updateOne(query, updateDoc, opt);
         });
         socket.emit("me", socket.id);
         socket.on("disconnect", () => {
            socket.broadcast.emit("callended");
         });
         socket.on("calluser", data => {
            console.log(data, "en calluser");
            const ojt = {
               signal: data.signalData,
               ...data,
            };
            socket.to(data.userToCall).emit("calluser", ojt);
         });
         socket.on("ansercall", data => {
            socket.to(data.to).emit("callaccepted", data.signal);
         });
      });
   })
   .catch(err => {
      console.log({ err });
   });

app.listen(process.env.PORT || 5000, "0.0.0.0", err => {
   if (err) {
      app.log.error(err);
      process.exit(1);
   }
});
