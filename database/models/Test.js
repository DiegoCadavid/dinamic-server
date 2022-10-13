const { Schema, model } = require("mongoose");

const testSchema = new Schema({
  string: {type: Schema.Types.String, default: "Texto predeterminado"},
  number: { type: Schema.Types.Number, min:10, max:40, required: true},
  boolean: {type: Schema.Types.Boolean, default: false},
});

const Test = model("Test", testSchema);
module.exports = Test;
