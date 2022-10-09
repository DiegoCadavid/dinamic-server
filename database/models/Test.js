const { Schema, model } = require("mongoose");

const testSchema = new Schema({
  string: Schema.Types.String,
  number: { type: Schema.Types.Number, min:10, max:40, required: true},
  boolean: Schema.Types.Boolean,
  mongoId: Schema.Types.ObjectId,
  date: Schema.Types.Date,
  subSchemas: {
    subOne : {  type: Schema.Types.String },
    subSecond : { type: Schema.Types.Number  }
  },
  array: [ { 
    type: Schema.Types.String, required: true
   }]
});

const Test = model("Test", testSchema);
module.exports = Test;
