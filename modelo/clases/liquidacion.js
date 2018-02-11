var mongoose = require("mongoose");
var ObjectId = mongoose.Schema.Types.ObjectId;
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

var liquidacionSchema = new Schema({
    empresa: { type: String, required: true },
    nombre: { type: String, required: true },
    mes: { type: Number, required: true },
    anio: { type: Number, required: true },
    mesAnio: { type: Date },
    empleadoId: { type: ObjectId },
    empleadoCi: { type: String },
    sueldo: { type: Number },
    cantidadFaltas: { type: Number },
    descuentoFaltas: { type: Number },
    cantidadHorasExtra: { type: Number },
    montoHorasExtra: { type: Number },
    montoFictoPropina: { type: Number },
    cantidadDescansoTrabajado: { type: Number },
    montoDescansoTrabajado : { type: Number },
    cantidadFeriadoPago: { type: Number },
    montoFeriadoPago: { type: Number },
    montoPrimaPorAntiguedad: { type: Number },
    montoPrimaPorProductividad: { type: Number },
    totalHaberesGravados: { type: Number },
    totalHaberes: { type: Number },
    montoAdelantos: { type: Number },
    montoRetenciones: { type: Number },
    valorAporteJubilatorio: { type: Number },
    descuentoAporteJubilatorio: { type: Number },
    valorFRL: { type: Number },
    descuentoFRL: { type: Number },
    valorSeguroPorEnfermedad: { type: Number },
    descuentoSeguroPorEnfermedad: { type: Number },
    valorAdicionalSNIS: { type: Number },
    descuentoSNIS: { type: Number },
    irpf: { type: Number },
    totalDescuentos: { type: Number },
    liquidoCobrar: { type: Number },
    diasGozarSV: { type: Number },
    montoDiaSV: { type: Number },
    egresoAguinaldo: { type: Number },
    egresoLicenciaNoGozada: { type: Number },
    egresoSV: { type: Number },
    egresoIPD: { type: Number },
    egresoAlicuotaAguinaldo: { type: Number },
    egresoAlicuotaLicencia: { type: Number },
    egresoAlicuotaSV: { type: Number },
    fechaLiquidacion: { type: Date }
});

module.exports = mongoose.model("Liquidacion", liquidacionSchema);