// Esto debe ser ASYNC o no funciona
module.exports = async function (fastify, opts) {
   const RoomsCollection = fastify.mongo.db.collection("rooms");

   fastify.get("/allrooms", async (req, res) => {
      const cursor = await RoomsCollection.find();
      const allRooms = await cursor.toArray();
      res.code(200).send(allRooms);
   });

   fastify.get("/roominfo", async (req, res) => {
      const { roomId } = req.query;
      const room = await RoomsCollection.findOne({ roomId });
      res.code(200).send({ success: true, roomData: room });
   });

   fastify.post("/", async (req, res) => {
      const result = await RoomsCollection.insertOne(req.body);
      if (!result || !result.acknowledged) {
         res.code(500).send({ success: false, msg: "Error interno" });
         return;
      }
      res.code(201).send({ success: true, msg: "created" });
   });
};
