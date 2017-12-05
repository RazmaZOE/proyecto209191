var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
var bcrypt = require("mongoose-bcrypt")

var usuarioSchema = new Schema({
    nombre: { type: String, required: true, unique: true, lowercase: true }, 
    password: { type: String, required: true, bcrypt: true },
    rol: String
});

usuarioSchema.plugin(require("mongoose-bcrypt"));

module.exports = mongoose.model("Usuario", usuarioSchema);