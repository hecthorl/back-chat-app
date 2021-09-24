const { writeFile, readFile } = require("fs");

const saveDB = (path, dataIncoming) => {
   readFile(path, (err, data) => {
      if (err) throw Error(err);
      const dataParsed = JSON.parse(data);
      const dataStringified = JSON.stringify([...dataParsed, dataIncoming]);
      writeFile(path, dataStringified, error => {
         if (err) throw Error(error);
      });
   });
};

module.exports = saveDB;
