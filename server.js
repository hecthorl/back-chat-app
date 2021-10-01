require("dotenv").config();
const fastify = require("fastify")({ logger: true });
const socket = require("fastify-socket.io");
const cors = require("fastify-cors");
const mongodb = require("fastify-mongodb");
const normalizeData = require("./dataParsed");

fastify.register(cors, {
   origin: ["https://front-chat-app.vercel.app", "http://localhost:3000"],
   methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
   allowedHeaders: ["Content-Type"],
   credentials: false,
});
fastify.register(socket, {
   cors: {
      origin: ["https://front-chat-app.vercel.app", "http://localhost:3000"],
      methods: ["GET", "POST"],
   },
});
fastify.register(mongodb, {
   url: process.env.MONGODB_URI,
   name: "roomsDB",
});

fastify.route({
   method: "GET",
   url: "/roominfo",
   schema: {
      response: {
         200: {
            type: "object",
            properties: {
               _id: { type: "string" },
               roomId: { type: "string" },
               roomName: { type: "string" },
               isPrivate: { type: "boolean" },
               userName: { type: "string" },
               __v: { type: "number" },
            },
         },
      },
   },
   handler: async function (request) {
      const { roomId } = request.query;
      const rooms = this.mongo.roomsDB.db.collection("rooms");
      return await rooms.findOne({ roomId });
   },
});
fastify.route({
   method: "POST",
   url: "/",
   schema: {
      response: {
         201: {
            type: "object",
            properties: {
               success: { type: "boolean" },
               message: { type: "string" },
            },
         },
      },
   },
   handler: async function (request) {
      const rooms = this.mongo.roomsDB.db.collection("rooms");
      const dataParsed = normalizeData(request.body);
      await rooms.insertOne(dataParsed);
      // console.log(res);
      return {
         success: true,
         message: "ok",
      };
   },
});
// Mucho callback :v
(async () => {
   try {
      await fastify.listen(4000);
      fastify.io.on("connection", socket => {
         socket.on("join_channel", data => {
            socket.join(data.room);

            socket.emit("join_channel", data);
         });

         socket.on("new message", data => {
            socket.to(data.room).emit("msg recibido", data);
         });
      });
   } catch (err) {
      fastify.log.error(err);
      process.exit(1);
   }
})();
// fastify.get("/", async (request, reply) => {
//    const rooms = this.mongo.db.collection("rooms");
//    console.log({ rooms });
//    return { hello: "world" };
// });
// fastify.post("/", async (request, reply) => {
//    console.log(typeof request.body);
//    return { hello: "world" };
// });
