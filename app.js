require('dotenv').config();
require("colors");


const Server = require('./Server');
const Sv = new Server();


// Creamos la ruta a base de un modelo importado
Sv.addRoute('user', require('./database/models/User'));

// Iniciamos servidor
Sv.init();