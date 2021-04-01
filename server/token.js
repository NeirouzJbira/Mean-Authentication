var mongoose = require("mongoose");
var Schema = mongoose.Schema;

//create a verification token
const tokenSchema = new Schema({
  _userId: { type: Schema.Types.ObjectId, required: true, ref: "user" },
  token: { type: String, required: true },
});
module.exports = mongoose.model("tokenSchema", tokenSchema);
