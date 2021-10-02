if (process.env.NODE_ENV !== "production") {
   require("dotenv").config();
}
const Fastify = require("fastify");
const cors = require("fastify-cors");
const socketsIO = require("fastify-socket.io");
const mongoDB = require("fastify-mongodb");

// Instantiate Fastify with some config
const app = Fastify();

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
app.register(require("./app.js"), { algo: "sadas" });

app.ready()
   .then(({ io, mongo }) => {
      const RoomsCollection = mongo.db.collection("rooms");

      io.on("connection", socket => {
         socket.on("join_channel", data => {
            socket.join(data.room);
            socket.emit("join_channel", data);
         });

         socket.on("new message", async data => {
            socket.to(data.roomId).emit("msg recibido", data);

            const query = { roomId: data.roomId };
            const updateDoc = {
               $push: { chat: data },
            };
            const opt = { upsert: true };
            // TODO: majear exepción
            await RoomsCollection.updateOne(query, updateDoc, opt);
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
