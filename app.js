const AccessToken = require('twilio').jwt.AccessToken
const VideoGrant = AccessToken.VideoGrant

// Esto debe ser ASYNC o no funciona
module.exports = async function (fastify, opts) {
   const RoomsCollection = fastify.mongo.db.collection('rooms')

   fastify.get('/allrooms', async (req, res) => {
      const cursor = await RoomsCollection.find()
      const allRooms = await cursor.toArray()
      res.code(200).send(allRooms)
   })
   fastify.post('/get_token', async (req, res) => {
      const accessToken = new AccessToken(
         process.env.ACCOUNT_SID,
         process.env.API_KEY_SID,
         process.env.API_KEY_SECRET,
         { identity: req.body.identity }
      )
      console.log(process.env.ACCOUNT_SID)
      const room = req.body.room
      const grant = new VideoGrant({ room })

      accessToken.addGrant(grant)

      res.status(201).send({ token: accessToken.toJwt() })
   })

   fastify.get('/', (req, res) => {
      res.code(200).send('allRooms')
   })

   fastify.get('/roominfo', async (req, res) => {
      const { roomId } = req.query
      const room = await RoomsCollection.findOne({ roomId })
      res.code(200).send({ success: true, roomData: room })
   })

   fastify.post('/', roomManage)

   /**
    * @param {import("fastify").FastifyRequest} req
    * @param {import("fastify").FastifyReply} res
    */
   async function roomManage(req, res) {
      const result = await RoomsCollection.insertOne(req.body)
      if (!result || !result.acknowledged) {
         res.code(500).send({ success: false, msg: 'Error interno' })
         return null
      }
      res.code(201).send({ success: true, msg: 'created' })
   }
}
