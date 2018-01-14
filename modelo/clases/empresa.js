var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

var empresaSchema = new Schema({
    nombre: { type: String, required: true, unique: true },
    razonSocial: { type: String, unique: true }, 
    numRut: { type: String, unique: true },
    numBps: { type: String, unique: true },
    numBse: { type: String },
    numMtss: { type: String },
    grupo: { type: Number },
    subgrupo: { type: Number },
    direccion: { type: String },
    telefono: { type: String },
    tipoContribuyente: { type: Number },
    tipoAportacion: { type: String },
});

module.exports = mongoose.model("Empresa", empresaSchema);