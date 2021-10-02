// Esto debe ser ASYNC o no funciona
module.exports = async function (fastify, opts) {
   fastify.get("/", (req, res) => {
      fastify.io.emit("hello", "gaaaaaaaaaaaaa");
      res.code(201).send("holi");
   });

   fastify.get("/roomId", (req, res) => {
      res.code(200).send({ Gaaaaa: 1111111111 });
   });

   fastify.post("/", async (req, res) => {
      const rooms = fastify.mongo.db.collection("rooms");
      const room = await rooms.findOne({ roomId: "sb5ikTDDKtS22IY8Y3ZI_" });
      res.code(201).send({ shhh: "perro1111111111", room });
   });
};
