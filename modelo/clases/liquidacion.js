var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

var liquidacionSchema = new Schema({
    fecha: String,
    nombre: String
});

module.exports = mongoose.model("Liquidacion", liquidacionSchema);