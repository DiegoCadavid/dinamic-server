# Dinamic Server

crea un API y una interfaz con sus respectivas validaciones en el lado del servidor y cliente de tu modelo de MongoDB facilmente ✨

Crear el API Rest ( CRUD ) con sus validaciones es tan sencillo como usar el metodo de una clase.

Ejemplo
```javascript
Sv.addRoute("user", require("./database/models/User.js"));
Sv.addRoute("test", require("./database/models/Test.js"));
```

## Instalar
```bash
npm i
```

```bash
# Creamos el archivo "./.env" en el directorio principal

# URL MONGO DATABASE
MONGO_URL = 
```

## Como usarlo

Para empezar a crear las rutas con sus respectivas validaciones debemos importar o crear el modelo de mongonse, te recomendamos hacerlo en "./database/models/*"

Ejemplo
```javascript
// ./database/models/User.js
const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  name: { type: Schema.Types.String, required: true, minLength: 10, maxLength: 20 },
  email: {
    type: Schema.Types.String,
    required: true,
    unique: true,
    match: [/^\w+@\w+(\.\w+)+$/gi, "El correo es invalido"],
  },
  age: { type: Schema.Types.Number, min: 18, max: 99, default: 22 },
  rol: { type: Schema.Types.String, default: "user" },
});

const User = model("User", userSchema);
module.exports = User;
```

Despues de crear el modelo vamos a "./app.js" y realizamos lo siguiente

```javascript
// Usamos le metodo "addRoute" de "Sv" y como parametros le pasamos el nombre de la ruta e importamos la ruta

Sv.addRoute('user', require('./database/models/User'));
```

Con esto tendriamos nuestra ruta creada con las validaciones de moongose