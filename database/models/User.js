const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  name: { type: Schema.Types.String, required: true },
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
