const moongose = require("mongoose");

const connectDB = () => {
  moongose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log("MongoDB conectada".green);
    })
    .catch(() => {
      console.log("Error al conectar con la base de datos".red);
    });
};

module.exports = connectDB;
