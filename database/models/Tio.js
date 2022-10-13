const { Schema, model } = require("mongoose");

const tioSchema = new Schema({
  name: { type: Schema.Types.String, default: "nombre", required: true },
  description: {
    type: Schema.Types.String,
    default: "Descripcion",
    required: true,
  },
  civil_status: { type: Schema.Types.Boolean, default: false },
});

const Tio = model("Tio", tioSchema);
module.exports = Tio;
