// Esto debe ser ASYNC o no funciona
module.exports = async function (fastify, opts) {
   fastify.get("/", (req, res) => {
      fastify.io.emit("hello", "gaaaaaaaaaaaaa");
      res.code(201).send("holi");
   });
   fastify.get("/roomId", (req, res) => {
      res.code(200).send({ Gaaaaa: 1111111111 });
   });
   fastify.post("/", (req, res) => {
      res.code(201).send({ Gaaaaa: 1111111111 });
   });
};
