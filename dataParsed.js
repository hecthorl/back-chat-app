const normalizeData = data => {
   if (typeof data !== "object") {
      return JSON.parse(data);
   }
   return data;
};

module.exports = normalizeData;
