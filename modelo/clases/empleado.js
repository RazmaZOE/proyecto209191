var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

var empleadoSchema = new Schema({
    nombres: { type: String, required: true },
    apellidos: { type: String, required: true },
    ci: { type: String, required: true},
    fechaNacimiento: { type: Date },
    fechaIngreso: { type: Date },
    seguroSalud: { type: Number },
    banco: { type: String },
    numSucursalBanco: { type: String },
    numCuentaBanco: { type: String },
    empresa: { type: String },
});

module.exports = mongoose.model("Empleado", empleadoSchema);