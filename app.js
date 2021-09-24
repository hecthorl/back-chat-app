const express = require("express");
const http = require("http");
// const jjj = require("./bdRooms.json");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const { Server } = require("socket.io");
const saveDB = require("./saveDB");

const PORT = process.env.PORT || 4000;

const io = new Server(server, {
   cors: {
      origin: ["https://front-chat-app.vercel.app", "http://localhost:3000"],
      methods: ["GET", "POST"],
   },
});
app.use(cors());
// app.get("/roominfo", (req, res) => {
//    const { roomId } = req.query;
//    const roomData = jjj.filter(item => item.roomId === roomId);
//    res.status(200).send(roomData);
// });

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
