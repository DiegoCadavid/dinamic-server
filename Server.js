// Creamos la clase server
const express = require("express");
const cors = require("cors");
const { mongoose } = require("mongoose");
const connectDB = require("./database/connectDB");
const DinamicRoute = require("./routes/DinamicRoute");

/**
 * Servidor express
 */
class Server {
  constructor() {
    this.app = express();

    this.middlewares();
    this.connectDb();
  }

  // Definimos middlewares
  middlewares() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  // Nos conectamos a la DB
  connectDb() {
    connectDB();
  }

  /**
   * Crea un CRUD con sus respectivas rutas y validaciones a base de un Modelo
   * @param {string} name nombre de la ruta
   * @param {mongoose.Model} model modelo 
   */
  addRoute(name = "", model = mongoose.Model) {
    const route = new DinamicRoute(name, model);
    this.app.use(`/${name}`, route.init());
    console.log( `Ruta creada para ${name}`.yellow )
  }

  /**
   * Inicia el servidor
   */
  init() {
    this.app.listen(process.env.PORT, () => {
      console.log();
      console.log(`Servidor iniciado en el puerto ${process.env.PORT}`.green);
    });
  }
}

module.exports = Server;
