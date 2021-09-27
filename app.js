const express = require("express");
const http = require("http");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const { Server } = require("socket.io");

const PORT = process.env.PORT || 4000;

const io = new Server(server, {
   cors: {
      origin: ["https://front-chat-app.vercel.app", "http://localhost:3000"],
      methods: ["GET", "POST"],
   },
});
app.use(cors());
io.on("connection", socket => {
   socket.on("join_channel", data => {
      socket.join(data.room);
      // saveDB("./bdRooms.json", data);
      socket.emit("join_channel", data);
   });

   socket.on("new message", data => {
      // console.log(data);
      socket.to(data.room).emit("msg recibido", data);
   });
});

server.listen(PORT, () => console.log("Server running causa"));
