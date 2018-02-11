var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

var empresaSchema = new Schema({
    nombre: { type: String, required: true, unique: true },
    razonSocial: { type: String, unique: true }, 
    numRut: { type: Number, unique: true },
    numBps: { type: Number, unique: true },
    numBse: { type: Number },
    numMtss: { type: Number },
    grupo: { type: Number },
    subgrupo: { type: Number },
    direccion: { type: String },
    telefono: { type: String },
    tipoContribuyente: { type: String },
    tipoAportacion: { type: String },
    perteneceA: { type: String }
});

module.exports = mongoose.model("Empresa", empresaSchema);