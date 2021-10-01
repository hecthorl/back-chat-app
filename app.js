module.exports = async function (fastify, opts) {
   fastify.get("/", (req, res) => {
      res.code(200).send({ Gaaaaa: 1111111111 });
   });
};
