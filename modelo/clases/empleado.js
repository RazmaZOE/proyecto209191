var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

var empleadoSchema = new Schema({
    nombres: { type: String, required: true },
    apellidos: { type: String, required: true },
    ci: { type: String, required: true},
    fechaNacimiento: { type: Date, required: true },
    fechaIngreso: { type: Date, required: true },
    fechaEgreso: { type: Date },
    seguroSalud: { type: Number, required: true },
    horario: { type: String },
    horasPorDia: { type: Number, required: true },
    cargo: { type: String },
    banco: { type: String },
    numSucursalBanco: { type: String },
    numCuentaBanco: { type: String },
    esJornalero: { type: Boolean },
    sueldo: { type: Number, required: true },
    empresa: { type: String },
    hijosMenores: { type: Number }
});

module.exports = mongoose.model("Empleado", empleadoSchema);