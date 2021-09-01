const express = require("express");
const http = require("http");

const app = express();
const server = http.createServer(app);

const { Server } = require("socket.io");

const urlOrigin = process.env.URL_ORIGIN || "http://localhost:3000";
const PORT = process.env.PORT || 4000;

const io = new Server(server, {
   cors: {
      origin: urlOrigin,
      methods: ["GET", "POST"],
   },
});

io.on("connection", socket => {
   socket.on("join_channel", data => {
      // console.log(data);
      socket.join(data.room);
      socket.emit("join_channel", data);
   });

   socket.on("new message", data => {
      socket.to(data.room).emit("msg recibido", data);
   });
});

server.listen(PORT, () => console.log("listening on 4000"));
