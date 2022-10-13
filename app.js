require('dotenv').config();
require("colors");


const Server = require('./Server');
const Sv = new Server();

// Creamos la ruta a base de un modelo importado
Sv.addRoute('user', require('./database/models/User'));
Sv.addRoute('test', require('./database/models/Test'));

// Iniciamos servidor
Sv.init();