module.exports = (roomId, data) => ({
   query: {
      roomId,
   },
   updateDoc: {
      $push: { chat: data },
   },
   opt: {
      upsert: true,
   },
});
