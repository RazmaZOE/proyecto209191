var Liquidacion = require("../clases/liquidacion");
var Empleado = require("../clases/empleado");
var Empresa = require("../clases/empresa");
var PDFDocument = require("pdfkit");
//var blobStream = require("../../node_modules/blob-stream/blob-stream");
var fs = require("fs");

exports.getLiquidaciones = function(req, res){
    Liquidacion.find({empresa: req.params.empresa},
        function(err, liquidaciones){
            if(err){
                res.send(err);
                console.log(err);
            }
            else{
                res.json(liquidaciones);
                console.log(liquidaciones);
            }
        }
    )
    // .then(
    //     Empleado.find({empresa: req.body.empresa}, function(err, empleados){
    //         if(err){
    //             res.send(err);
    //             console.log(err);
    //         }
    //         else{
    //             res.json(empleados);
    //             console.log(empleados);
    //         }
    //     })
    // )
    ;
};

// exports.getTiposHaberes = function(req, res){
//     var tiposHaberes = [
//         { titulo: "Faltas" },
//         { titulo: "Presentismo" }
//     ];
//     res.json(tiposHaberes);
// }

exports.calcularMontoJornales = function(req, res){
    var jornales = parseInt(req.body.jornales);
    var sueldo = parseInt(req.body.sueldo);
    var montoJornales = 0;

    montoJornales = sueldo * jornales;
    montoJornales = Math.round(montoJornales * 100) / 100;

    res.send(montoJornales.toString());
}

exports.calcularFaltas = function(req, res){
    var faltas = parseInt(req.body.faltas);
    var sueldo = parseInt(req.body.sueldo);
    var descuentoFaltas = 0;

    descuentoFaltas = sueldo / 30 * faltas;
    descuentoFaltas = Math.round(descuentoFaltas * 100) / 100; //para tener decimales
    //var montoHorasExtra = (sueldo / 30 / 8 * horasExtra) * 2;
    console.log("Descuento Faltas: " + descuentoFaltas);

    res.send(descuentoFaltas.toString());
}

exports.calcularHorasExtra = function(req, res){
    console.log("Horas Extra: " + req.body.horasExtra);
    var horasExtra = parseInt(req.body.horasExtra);
    var sueldo = parseInt(req.body.sueldo);
    var horasPorDia = parseInt(req.body.horasPorDia);
    var montoHorasExtra = 0;

    montoHorasExtra = (sueldo / 30 / horasPorDia * horasExtra) * 2;
    montoHorasExtra = Math.round(montoHorasExtra * 100) / 100;

    res.send(montoHorasExtra.toString());
}

exports.calcularDescansoTrabajado = function(req, res){
    var horasDescansoTrabajado = parseInt(req.body.descansoTrabajado);
    var horasPorDia = parseInt(req.body.horasPorDia);
    var sueldo = parseFloat(req.body.sueldo);
    var montoDescansoTrabajado = 0;

    montoDescansoTrabajado = sueldo / 30 / horasPorDia * horasDescansoTrabajado;
    montoDescansoTrabajado = Math.round(montoDescansoTrabajado * 100) / 100;

    res.send(montoDescansoTrabajado.toString());
}

exports.calcularFeriadoTrabajado = function(req, res){
    var cantidadFeriadoPago = parseInt(req.body.feriadoPago);
    var sueldo = parseFloat(req.body.sueldo);
    var montoFeriadoPago = 0;

    montoFeriadoPago = sueldo / 30 * cantidadFeriadoPago;
    montoFeriadoPago = Math.round(montoFeriadoPago * 100) / 100;

    res.send(montoFeriadoPago.toString());
}

exports.calcularDiasGozados = function(req, res){
    var dateLiquidacion = new Date(req.params.anio, req.params.mes - 1);
    var anioLiquidacion = dateLiquidacion.getFullYear();
    var diasGozados = 0;
    Liquidacion.find({
        empresa: req.params.empresa,
        nombre: "Salario Vacacional",
        anio: anioLiquidacion,
        empleadoId: req.params.empleadoId
    }, function(err, liquidaciones){
            if(err){
                res.send(err);
                console.log(err);
            }
            else{
                if(liquidaciones != null){
                    liquidaciones.forEach(function(liq){
                        diasGozados = diasGozados + liq.diasGozarSV;
                    });
                }
                res.send(diasGozados.toString());
            }
        }
    );
}

exports.calcularSalarioVacacional = function(req, res){
    var diasGozados = parseInt(req.body.diasGozados);
    var diasLicencia = parseInt(req.body.diasLicencia);
    var diasGozar = parseInt(req.body.diasGozar);
    if(diasLicencia - diasGozados > 0){
        if(diasGozar + diasGozados <= diasLicencia){
            var sueldo = parseInt(req.body.sueldo);
            var fechaActual = new Date(req.body.anioLiquidacion, req.body.mesLiquidacion - 1);
            // fechaActual.setMonth(fechaActual.getMonth()+1); //quiero que sea un mes más porque el $lt no lo incluye
            var fechaDesde = new Date(req.body.anioLiquidacion, req.body.mesLiquidacion - 1);
            fechaDesde.setMonth(fechaDesde.getMonth()-13);
            var extras = 0;
            var cont = 0;
            var montoSVnominal = 0;
            var montoSVdia = 0;
            var montoSVliquido = 0;
            var promedioExtras = 0;
            console.log("req.body: " + req.body.porcentajeDeducciones + " " + req.body.diasGozar)
            var deducciones = parseFloat(req.body.porcentajeDeducciones) / 100;

            Liquidacion.find({
                empresa: req.body.empresa,
                nombre: "Sueldo",
                mesAnio: { $gt: fechaDesde, $lt: fechaActual },
                empleadoId: req.body.empleadoId
            }, function(err, liquidaciones){
                    if (err){
                        res.send(err);
                        console.log(err);
                    }
                    else{
                        console.log("liquidaciones para SV: " + liquidaciones != []);
                        if(liquidaciones != []){
                            console.log("Entró al if de liquidaciones != []");
                            liquidaciones.forEach(function(liq){
                                cont++;
                                extras = extras + liq.montoHorasExtra + liq.montoFictoPropina + liq.montoDescansoTrabajado + liq.montoFeriadoPago + liq.montoPrimaPorAntiguedad + liq.montoPrimaPorProductividad;
                            });
                            promedioExtras = extras / cont;
                        }
                        console.log("Resultado del foreach: " + extras + " - " + cont);
                        montoSVnominal = sueldo + promedioExtras;
                        var descuentos = montoSVnominal * deducciones;
                        montoSVdia = (montoSVnominal - descuentos) / 30
                        //montoSVdia = Math.round(montoSVdia *100) / 100
                        montoSVliquido = montoSVdia * diasGozar;
                        //montoSVliquido = Math.round(montoSVliquido *100) / 100;
                        console.log("Montos: " + montoSVnominal + " " + descuentos + " " + sueldo + " " + deducciones + " " + diasGozar + " " + montoSVliquido);
                        res.json({
                            exito: true,
                            montoSVdia: montoSVdia,
                            montoSVliquido: montoSVliquido
                        });
                    }
                }
            );
            //calcular promedio de los haberes variables del empleado de los últimos 12 meses (o en lo meses que trabajó si son menos) (horas extra, etc)
            // sueldo + promedio / 12 ESTO ES NOMINAL
            // Lo paso a líquido (depende del código de salud, puedo traerlo desdel el front el porcentaje)
            //devuelvo el liquido porque el SV NO tiene descuentos en el recibo
        }
        else{
            res.json({
                exito: false,
                mensaje: "No quedan días a liquidar"
            });
        }
    }
    else{
        res.json({
            exito: false,
            mensaje: "No quedan días a liquidar"
        });
    }
    
}

exports.calcularAguinaldo = function(req, res){
    if(req.params.mes == 6 || req.params.mes == 12){
        var dateMesAnioActual = new Date(req.params.anio, req.params.mes - 1);
        var mesDesde = new Date(req.params.anio, req.params.mes - 1);
        mesDesde.setMonth(mesDesde.getMonth()-7);
        console.log("Mes mayor a: " + mesDesde);
        console.log("Mes menor a: " + dateMesAnioActual);
        Liquidacion.find({
            empresa: req.params.empresa,
            nombre: "Sueldo",
            mesAnio: { $gt: mesDesde, $lt: dateMesAnioActual },
            empleadoId: req.params.empleadoId
        }, function (err, liquidaciones){
                if(err){
                    res.send(err);
                    console.log(err);
                }
                else{
                    res.json({
                        exito: true,
                        nombreLiquidacion: "Aguinaldo",
                        info: liquidaciones
                    });
                    console.log("Liquidaciones Aguinaldo: " + liquidaciones);
                }
            }
        );
    }
    else{
        res.json({
            exito: false,
            nombreLiquidacion: "Aguinaldo",
            info: "El aguinaldo se puede calcular solo en los meses 6 y 12"
        });
    }
}

exports.calcularIrpf = function(req, res){
    console.log("IRPF - body: " + req.body.empleadoId + " - " + req.body.mes + " - " + req.body.anio + " - " + req.body.empresa);
    var mes = parseInt(req.body.mes);
    var anio = parseInt(req.body.anio);
    var nombreLiquidacion = req.body.nombreLiquidacion;
    var bpc = 0;
    if(anio == 2018){
        bpc = 3848;
    }
    if(anio == 2017){
        bpc = 3611;
    }
    if(anio == 2016){
        bpc = 3340;
    }
    if(anio == 2015){
        bpc = 3052;
    }
    if(anio == 2014){
        bpc = 2819;
    }
    if(anio == 2013){
        bpc = 2598;
    }

    if(mes == 12){
        var computableDic = req.body.haberesIrpf;
        var computableSVoAguinaldoDic = req.body.haberesIrpfVacacional;
        var deduccionesDic = req.body.descuentosIrpf;
        var montoDescuentoPorHijoAnual = 13 * bpc;
        var fechaIngresoEmpleado = new Date(req.body.fechaIngresoEmpleado);
        if(fechaIngresoEmpleado.getFullYear() == anio){
            var mesesTrabajados = 12 - fechaIngresoEmpleado.getMonth(); //no le pongo +1 al mes porque quiero que si ingresó en mes 10 de 3 meses trabajados y no 2
            montoDescuentoPorHijoAnual = montoDescuentoPorHijoAnual * mesesTrabajados / 12;
        }
        var hijosMenoresAnual = req.body.hijosMenores * montoDescuentoPorHijoAnual;
        var fechaDesde = new Date(anio-1, mes-1);//Diciembre Año pasado (no lo va a incluir)
        var fechaHasta = new Date(anio, mes-1);
        fechaHasta.setMonth(fechaHasta.getMonth()+1);//Enero año que viene (no lo va a incluir)
        var totalIrpfEneNov = 0;
        var totalSueldosEneNov = 0;
        var totalDeduccionesEneNov = 0;
        var totalSVmasAguinaldos = 0;
        var totalIrpfAnual = 0;
        var totalSVmasAguinaldosAnual = 0;
        var totalDeduccionesAnual = 0;
        Liquidacion.find({
            empresa: req.body.empresa,
            mesAnio: { $gt: fechaDesde, $lt: fechaHasta },
            empleadoId: req.body.empleadoId
        },
            function(err, liquidaciones){
                if(err){
                    res.send(err);
                }
                else{
                    if(liquidaciones != []){
                        console.log("entró a liquidaciones");
                        liquidaciones.forEach(function(liq){
                            console.log(!(liq.mes == 12 && liq.nombre == nombreLiquidacion));
                            if(liq.irpf != null && !(liq.mes == 12 && liq.nombre == nombreLiquidacion)){
                                console.log(totalIrpfEneNov);
                                totalIrpfEneNov = totalIrpfEneNov + liq.irpf;
                            }
                            if(liq.nombre == "Sueldo" && !(liq.mes == 12 && liq.nombre == nombreLiquidacion)){
                                //No quiero que si edito el mes 12 me lo cuente
                                console.log("Entró en sueldo IRPF Anual a sumar");
                                console.log(totalSueldosEneNov);
                                totalSueldosEneNov = totalSueldosEneNov + liq.totalHaberesGravados;
                                totalDeduccionesEneNov = totalDeduccionesEneNov + liq.descuentoAporteJubilatorio + liq.descuentoFRL + liq.descuentoSeguroPorEnfermedad + liq.descuentoSNIS;
                            }
                            if(liq.nombre == "Salario Vacacional" && !(liq.mes == 12 && liq.nombre == nombreLiquidacion)){
                                totalSVmasAguinaldos = totalSVmasAguinaldos + liq.totalHaberes;
                                console.log("Entró en SV IRPF Anual a sumar :" + totalSVmasAguinaldos);
                            }
                            if(liq.nombre == "Aguinaldo" && !(liq.mes == 12 && liq.nombre == nombreLiquidacion)){
                                totalSVmasAguinaldos = totalSVmasAguinaldos + liq.totalHaberes;
                                console.log("Entró en SV IRPF Anual a sumar :" + totalSVmasAguinaldos);
                                totalDeduccionesEneNov = totalDeduccionesEneNov + liq.descuentoAporteJubilatorio + liq.descuentoFRL + liq.descuentoSeguroPorEnfermedad + liq.descuentoSNIS;
                            }
                            if(liq.nombre == "Egreso" && !(liq.mes == 12 && liq.nombre == nombreLiquidacion)){
                                totalSueldosEneNov = totalSueldosEneNov + liq.egresoLicenciaNoGozada;
                                totalSVmasAguinaldos = totalSVmasAguinaldos + liq.egresoSV;
                                totalDeduccionesEneNov = totalDeduccionesEneNov + liq.descuentoAporteJubilatorio + liq.descuentoFRL + liq.descuentoSeguroPorEnfermedad + liq.descuentoSNIS;
                            }
                        });
                    }
                }
                totalIrpfAnual = totalSueldosEneNov + computableDic;
                console.log("Total Ingresos Sueldo Anual: " + totalIrpfAnual);
                totalSVmasAguinaldosAnual = totalSVmasAguinaldos + computableSVoAguinaldoDic;
                console.log("Total Ingresos SV y Aguinaldo Anual: " + totalSVmasAguinaldos + " - " + computableSVoAguinaldoDic);
                totalDeduccionesAnual = totalDeduccionesEneNov + deduccionesDic;
                console.log("Total Deducciones Anual: " + totalDeduccionesAnual);

                var totalIrpf = 0;
                var restoComputable = totalIrpfAnual;
                var porcentaje = 0;

                var franja1 = 84*bpc - 0*bpc;
                restoComputable = restoComputable - franja1;

                if(totalIrpfAnual >= (84 * bpc)){
                    var franja2 = 120*bpc - 84*bpc;
                    var porcentajeFranja2 = 10/100;
                    porcentaje = porcentajeFranja2;
                    if(franja2 > restoComputable){
                        totalIrpf = totalIrpf + (restoComputable * porcentajeFranja2);
                    }
                    else{
                        totalIrpf = totalIrpf + (franja2 * porcentajeFranja2);
                    }
                    restoComputable = restoComputable - franja2;
                }
                if(totalIrpfAnual >= (120 * bpc)){
                    var franja3 = 180*bpc - 120*bpc;
                    var porcentajeFranja3 = 15/100;
                    porcentaje = porcentajeFranja3;
                    if(franja3 > restoComputable){
                        totalIrpf = totalIrpf + (restoComputable * porcentajeFranja3);
                    }
                    else{
                        totalIrpf = totalIrpf + (franja3 * porcentajeFranja3);
                    }
                    restoComputable = restoComputable - franja3;
                }
                if(totalIrpfAnual >= (180 * bpc)){
                    var franja4 = 360*bpc - 180*bpc;
                    var porcentajeFranja4 = 24/100;
                    porcentaje = porcentajeFranja4;
                    if(franja4 > restoComputable){
                        totalIrpf = totalIrpf + (restoComputable * porcentajeFranja4);
                    }
                    else{
                        totalIrpf = totalIrpf + (franja4 * porcentajeFranja4);
                    }
                    restoComputable = restoComputable - franja4;
                }
                if(totalIrpfAnual >= (360 * bpc)){
                    var franja5 = 600*bpc - 360*bpc;
                    var porcentajeFranja5 = 25/100;
                    porcentaje = porcentajeFranja5;
                    if(franja5 > restoComputable){
                        totalIrpf = totalIrpf + (restoComputable * porcentajeFranja5);
                    }
                    else{
                        totalIrpf = totalIrpf + (franja5 * porcentajeFranja5);
                    }
                    restoComputable = restoComputable - franja5;
                }
                if(totalIrpfAnual >= (600 * bpc)){
                    var franja6 = 900*bpc - 600*bpc;
                    var porcentajeFranja6 = 27/100;
                    porcentaje = porcentajeFranja6;
                    if(franja6 > restoComputable){
                        totalIrpf = totalIrpf + (restoComputable * porcentajeFranja6);
                    }
                    else{
                        totalIrpf = totalIrpf + (franja6 * porcentajeFranja6);
                    }
                    restoComputable = restoComputable - franja6;
                }
                if(totalIrpfAnual >= (900 * bpc)){
                    var franja7 = 1380*bpc - 900*bpc;
                    var porcentajeFranja7 = 31/100;
                    porcentaje = porcentajeFranja7;
                    if(franja7 > restoComputable){
                        totalIrpf = totalIrpf + (restoComputable * porcentajeFranja7);
                    }
                    else{
                        totalIrpf = totalIrpf + (franja7 * porcentajeFranja7);
                    }
                    restoComputable = restoComputable - franja7;
                }
                if(totalIrpfAnual >= (1380 * bpc)){
                    var porcentajeFranja8 = 36/100;
                    porcentaje = porcentajeFranja8;
                    totalIrpf = totalIrpf + (restoComputable * porcentajeFranja8);
                }

                console.log("Deducciones por hijos: " + hijosMenoresAnual);
                totalDeduccionesAnual = totalDeduccionesAnual + hijosMenoresAnual;
                var tasaComputable = 0;
                if(totalIrpfAnual <= (180 * bpc)){
                    tasaComputable = 10/100;
                }
                else{
                    tasaComputable = 8/100;
                }
                totalDeduccionesAnual = totalDeduccionesAnual * tasaComputable;
                console.log("IRPF Anual total sueldos: " + totalIrpf);
                console.log("IRPF Anual total deducciones: " + totalDeduccionesAnual);
                console.log("IRPF Anual total Sv y aguinaldos: " + totalSVmasAguinaldosAnual);
                console.log("IRPF Anual porcentaje franja mayor: " + porcentaje);
                console.log("IRPF Anual pagos Ene-Nov: " + totalIrpfEneNov);
                totalIrpf = totalIrpf - totalDeduccionesAnual;
                var totalIrpfSVyAguinaldo = totalSVmasAguinaldosAnual * porcentaje;
                var totalAnual = totalIrpf + totalIrpfSVyAguinaldo;
                totalAnual = totalAnual - totalIrpfEneNov;
                totalAnual = Math.round(totalAnual);
                console.log("IRPF Anual total después descuentos: " + totalAnual);
                console.log("IRPF TOTAL ANUAL: " + (totalIrpfEneNov + totalAnual));
                if(totalAnual<0){
                    totalAnual = 0;
                }

                res.send(totalAnual.toString());
                // res.json({
                //     total: totalAnual,
                //     totalSueldos: totalIrpf,
                //     totalSVmasAguinaldos: totalIrpfSVyAguinaldo,
                //     porcentajeMayor: porcentaje,
                // });
            }
        )
    }
    else{
        var montoDescuentoPorHijo = 13 * bpc / 12;
        console.log("IRPF - BPC: " + bpc);
        var computable = req.body.haberesIrpf; //Tengo que pasar ambos datos, seguramente uno en 0 a menos que el que llame sea Egreso
        console.log("IRPF - computable: " + computable);
        var computableVacacional = req.body.haberesIrpfVacacional; //Tengo que pasar ambos datos, seguramente uno en 0 a menos que el que llame sea Egreso
        console.log("IRPF - cmputableVacacional: " + computableVacacional);
        var deducciones = req.body.descuentosIrpf;
        console.log("IRPF - deducciones: " + deducciones);
        var hijosMenores = req.body.hijosMenores;
        console.log("IRPF - hijos: " + hijosMenores);
        var deduccionesHijos = hijosMenores * montoDescuentoPorHijo;
        console.log("IRPF - deduccionesHijos: " + deduccionesHijos);
        deducciones = deducciones + deduccionesHijos;
        console.log("IRPF - deducciones: " + deducciones);
        var tasaComputable = 0;
        if(computable <= (15 * bpc)){
            tasaComputable = 10/100;
        }
        else{
            tasaComputable = 8/100;
        }
        console.log("IRPF - tasaComputable: " + tasaComputable);
        var totalIrpf = 0;

        var irpfOtrasLiquidaciones = 0;
        //Busco si hay otras liquidaciones en ese mes para restarle el irpf
        
        Liquidacion.find({
            empresa: req.body.empresa,
            mes: mes,
            anio: anio,
            empleadoId: req.body.empleadoId
        },
            function(err, liquidaciones){
                if(err){
                    res.send(err);
                }
                else{
                    console.log("IRPF - otras liquidaciones mes: " + liquidaciones);
                    if(liquidaciones != []){
                        liquidaciones.forEach(function(liq){
                            if(liq.irpf != null && liq.nombre != nombreLiquidacion){
                                irpfOtrasLiquidaciones = irpfOtrasLiquidaciones + liq.irpf;
                            }
                            if(liq.nombre == "Sueldo" && liq.nombre != nombreLiquidacion){
                                computable = computable + liq.totalHaberes;
                            }
                            if(liq.nombre == "Salario Vacacional" && liq.nombre != nombreLiquidacion){
                                computableVacacional = computableVacacional + liq.totalHaberes;
                                console.log("IRPF - computableVacacional en búsqueda: " + computableVacacional);
                            }
                            if(liq.nombre == "Egreso" && liq.nombre != nombreLiquidacion){
                                computable = computable + liq.egresoLicenciaNoGozada;
                                computableVacacional = computableVacacional + liq.egresoSV;
                            }
                        });
                    }
                    var computableTotal = computable;
                    if(computable + computableVacacional  > 10*bpc){
                        computableTotal = (computable * 1.06) + computableVacacional; //le sumo 6%
                    }
                    else{
                        computableTotal = computableTotal + computableVacacional;
                    }
                    console.log("IRPF - computable + vacacional: " + computableTotal);
                    var restoComputable = computableTotal;

                    var franja1 = 7*bpc - 0*bpc;
                    restoComputable = restoComputable - franja1;

                    if(computableTotal >= (7 * bpc)){
                        var franja2 = 10*bpc - 7*bpc;
                        var porcentajeFranja2 = 10/100;
                        if(franja2 > restoComputable){
                            totalIrpf = totalIrpf + (restoComputable * porcentajeFranja2);
                        }
                        else{
                            totalIrpf = totalIrpf + (franja2 * porcentajeFranja2);
                        }
                        restoComputable = restoComputable - franja2;
                    }
                    if(computableTotal >= (10 * bpc)){
                        var franja3 = 15*bpc - 10*bpc;
                        var porcentajeFranja3 = 15/100;
                        if(franja3 > restoComputable){
                            totalIrpf = totalIrpf + (restoComputable * porcentajeFranja3);
                        }
                        else{
                            totalIrpf = totalIrpf + (franja3 * porcentajeFranja3);
                        }
                        restoComputable = restoComputable - franja3;
                    }
                    if(computableTotal >= (15 * bpc)){
                        var franja4 = 30*bpc - 15*bpc;
                        var porcentajeFranja4 = 24/100;
                        if(franja4 > restoComputable){
                            totalIrpf = totalIrpf + (restoComputable * porcentajeFranja4);
                        }
                        else{
                            totalIrpf = totalIrpf + (franja4 * porcentajeFranja4);
                        }
                        restoComputable = restoComputable - franja4;
                    }
                    if(computableTotal >= (30 * bpc)){
                        var franja5 = 50*bpc - 30*bpc;
                        var porcentajeFranja5 = 25/100;
                        if(franja5 > restoComputable){
                            totalIrpf = totalIrpf + (restoComputable * porcentajeFranja5);
                        }
                        else{
                            totalIrpf = totalIrpf + (franja5 * porcentajeFranja5);
                        }
                        restoComputable = restoComputable - franja5;
                    }
                    if(computableTotal >= (50 * bpc)){
                        var franja6 = 75*bpc - 50*bpc;
                        var porcentajeFranja6 = 27/100;
                        if(franja6 > restoComputable){
                            totalIrpf = totalIrpf + (restoComputable * porcentajeFranja6);
                        }
                        else{
                            totalIrpf = totalIrpf + (franja6 * porcentajeFranja6);
                        }
                        restoComputable = restoComputable - franja6;
                    }
                    if(computableTotal >= (75 * bpc)){
                        var franja7 = 115*bpc - 75*bpc;
                        var porcentajeFranja7 = 31/100;
                        if(franja7 > restoComputable){
                            totalIrpf = totalIrpf + (restoComputable * porcentajeFranja7);
                        }
                        else{
                            totalIrpf = totalIrpf + (franja7 * porcentajeFranja7);
                        }
                        restoComputable = restoComputable - franja7;
                    }
                    if(computableTotal >= (115 * bpc)){
                        //var franja8 = 115*bpc;
                        var porcentajeFranja8 = 36/100;
                        totalIrpf = totalIrpf + (restoComputable * porcentajeFranja8);
                    }

                    var deduccionesIrpf = deducciones * tasaComputable;
                    totalIrpf = totalIrpf - deduccionesIrpf - irpfOtrasLiquidaciones;
                    totalIrpf = Math.round(totalIrpf); //lo quiero sin decimales
                    if(totalIrpf < 0){
                        totalIrpf = 0;
                    }
                    
                    res.send(totalIrpf.toString());
                }
            }
        );
    }
    
}

exports.calcularEgreso = function(req, res){
    var promedioExtras = 0;
    var fechaActual = new Date(req.body.anioLiquidacion, req.body.mesLiquidacion - 1);
    fechaActual.setMonth(fechaActual.getMonth()+1); //incluyo un mes más para buscar también el sueldo del mes actual para el calculo de aguinaldo
    var fechaDesde = new Date(req.body.anioLiquidacion, req.body.mesLiquidacion - 1);
    fechaDesde.setMonth(fechaDesde.getMonth()-13);
    var fechaEgreso = new Date(req.body.fechaEgreso);
    var cont = 0;
    var extras = 0;
    var montoAguinaldo = 0;
    Liquidacion.find({
        empresa: req.body.empresa,
        nombre: "Sueldo",
        mesAnio: { $gt: fechaDesde, $lt: fechaActual },
        empleadoId: req.body.empleadoId
    },  function(err, liquidaciones){
            if(err){
                res.send(err);
                console.log(err);
            }
            else{
                if(liquidaciones != null){
                    fechaActual.setMonth(fechaActual.getMonth() - 1);//venía arrastrando un +1
                    var mesActual = fechaActual.getMonth();
                    var condicionMesActual = mesActual >= 5 && mesActual <= 10;
                    if(condicionMesActual){
                        var fechaDesdeAguinaldo = new Date(req.body.anioLiquidacion, 5);
                    }
                    else{
                        if(mesActual > 10){
                            var fechaDesdeAguinaldo = new Date(req.body.anioLiquidacion, 11);
                        }
                        else{
                            var fechaDesdeAguinaldo = new Date(req.body.anioLiquidacion -1, 11);
                        }
                    }
                    console.log("fecha desde aguinaldo: " + fechaDesdeAguinaldo);
                    console.log("fecha hasta aguinaldo: " + fechaEgreso);
                    liquidaciones.forEach(function(liq){
                        if(liq.mesAnio < fechaEgreso){
                            cont++;
                            extras = extras + liq.montoHorasExtra;
                        }
                        if(condicionMesActual){
                            //Pregunto si el mes actual está entre junio y noviembre
                            if(liq.mesAnio >= fechaDesdeAguinaldo && liq.mesAnio <= fechaEgreso){
                                montoAguinaldo = montoAguinaldo + liq.totalHaberes;
                            }
                        }
                        else{
                            //Si cae acá mes actual está entre diciembre y mayo
                            if(liq.mesAnio >= fechaDesdeAguinaldo && liq.mesAnio <= fechaEgreso){
                                console.log("total haberes: " + liq.totalHaberes);
                                montoAguinaldo = montoAguinaldo + liq.totalHaberes;
                                console.log("aguinaldo: " + montoAguinaldo + " - " + liq.mesAnio);
                            }
                        }
                    });
                    montoAguinaldo = montoAguinaldo / 12;
                    var promedioExtras = extras / cont;
                }
                var sueldo = parseFloat(req.body.sueldo);
                var montoBaseNominal = sueldo + promedioExtras;
                // var descuentos = montoBaseNominal * (parseFloat(req.body.porcentajeDeducciones) / 100);
                // var montoBaseLiquido = montoBaseNominal - descuentos;

                var diasLicenciaTotalAnual = 0;
                var diasLicenciaNoGozados = 0;
                //preguntar si los días de licencia son los del año pasado o si tengo que calcular los de este año
                var anioLicencia = fechaEgreso.getFullYear();
                var primerDiaAnio = new Date(anioLicencia, 00, 01);
                var ultDiaAnio = new Date(anioLicencia + 1, 00, 01) //Toma la hora 0:00 del día => 01ene-00:00 = 31dic24:00
                var fechaIngreso = new Date(req.body.fechaIngreso);
                var aniosTrabajados = ultDiaAnio.getFullYear() - 1 - fechaIngreso.getFullYear();
                console.log("ult dia anio: " + ultDiaAnio);
                
                if(aniosTrabajados < 1){
                    diasLicenciaTotalAnual = (ultDiaAnio - fechaIngreso) / (1000*60*60*24); //dias
                    diasLicenciaTotalAnual = Math.round(diasLicenciaTotalAnual * 20 / 365);
                }
                if (aniosTrabajados >= 1 && aniosTrabajados < 5 ){
                    diasLicenciaTotalAnual = 20;
                }
                if(aniosTrabajados >= 5){
                    diasLicenciaTotalAnual = 20 + parseInt(aniosTrabajados/4);
                }
                diasLicenciaNoGozados = (fechaEgreso - primerDiaAnio) / (1000*60*60*24); //dias
                console.log("días licencia no gozados " + diasLicenciaNoGozados);
                //diasLicenciaNoGozados = Math.round(diasLicenciaNoGozados * (diasLicenciaTotalAnual / 12) / 30 * 100) / 100;
                diasLicenciaNoGozados = Math.round(diasLicenciaNoGozados * (diasLicenciaTotalAnual / 12) / 30);
                console.log("días licencia no gozados " + diasLicenciaNoGozados);
                var diasSinGozarAnioAnterior = parseInt(req.body.diasLicenciaAnioAnterior) - parseInt(req.body.diasGozadosAnioAnterior);
                diasLicenciaNoGozados = diasLicenciaNoGozados + diasSinGozarAnioAnterior;
                console.log("fecha Egreso: " + fechaEgreso);
                console.log("primer día del año: " + primerDiaAnio);
                console.log("días sin gozar año anterior " + diasSinGozarAnioAnterior);
                console.log("días licencia no gozados " + diasLicenciaNoGozados);

                var tieneIPD = req.body.tieneIPD;
                var montoIPD = 0;
                var alicuotaAguinaldo = 0;
                var alicuotaLicencia = 0;
                var alicuotaSV = 0;
                if(tieneIPD){
                    var anioTrabajadoIPD = fechaEgreso.getFullYear() - fechaIngreso.getFullYear();
                    console.log("Años trabajados IPD: " + anioTrabajadoIPD);
                    console.log("Condiciones entrar if años IPD: " + (fechaEgreso.getMonth() >= fechaIngreso.getMonth()) + (fechaEgreso.getDate() >= fechaIngreso.getDate()));
                    if(fechaEgreso.getMonth() >= fechaIngreso.getMonth()){
                        if(fechaEgreso.getDate() >= fechaIngreso.getDate()){
                            anioTrabajadoIPD = anioTrabajadoIPD + 1;
                        }
                    }
                    if(anioTrabajadoIPD > 6){
                        anioTrabajadoIPD = 6;
                    }
                    montoIPD = montoBaseNominal * anioTrabajadoIPD;
                    console.log("MONTO IPD: " + montoIPD);
                    alicuotaAguinaldo = montoAguinaldo * anioTrabajadoIPD;
                    alicuotaLicencia = montoBaseNominal / 30 * anioTrabajadoIPD * diasLicenciaTotalAnual / 12;
                    alicuotaSV = montoBaseNominal / 30 * anioTrabajadoIPD * diasLicenciaTotalAnual / 12;
                }

                res.json({
                    exito: true,
                    nombre: "Egreso",
                    diasLicenciaNoGozados: diasLicenciaNoGozados,
                    montoBaseNominal: montoBaseNominal,
                    aguinaldo: montoAguinaldo,
                    tieneIPD: tieneIPD,
                    aniosTrabajados: aniosTrabajados,
                    montoIPD: montoIPD,
                    alicuotaAguinaldo: alicuotaAguinaldo,
                    alicuotaLicencia: alicuotaLicencia,
                    alicuotaSV: alicuotaSV
                });
            }
    });
}

exports.guardarNueva = function(req, res){
    var dateMesAnio = new Date(req.body.anio, req.body.mes - 1);
    var liquidacion = new Liquidacion({
        empresa: req.body.empresa,
        nombre: req.body.nombre,
        mes: req.body.mes,
        anio: req.body.anio,
        mesAnio: dateMesAnio,
        empleadoId: req.body.empleadoId,
        empleadoCi: req.body.empleadoCi,
        empleado: req.body.empleado,
        sueldo: req.body.sueldo,
        cantidadFaltas: req.body.cantidadFaltas,
        descuentoFaltas: req.body.descuentoFaltas,
        cantidadHorasExtra: req.body.cantidadHorasExtra,
        montoHorasExtra: req.body.montoHorasExtra,
        montoFictoPropina: req.body.montoFictoPropina,
        cantidadDescansoTrabajado: req.body.cantidadDescansoTrabajado,
        montoDescansoTrabajado : req.body.montoDescansoTrabajado,
        cantidadFeriadoPago: req.body.cantidadFeriadoPago,
        montoFeriadoPago: req.body.montoFeriadoPago,
        montoPrimaPorAntiguedad: req.body.montoPrimaPorAntiguedad,
        montoPrimaPorProductividad: req.body.montoPrimaPorProductividad,
        totalHaberesGravados: req.body.totalHaberesGravados,
        totalHaberes: req.body.totalHaberes,
        montoAdelantos: req.body.montoAdelantos,
        montoRetenciones: req.body.montoRetenciones,
        valorAporteJubilatorio: req.body.valorAporteJubilatorio,
        descuentoAporteJubilatorio: req.body.descuentoAporteJubilatorio,
        valorFRL: req.body.valorFRL,
        descuentoFRL: req.body.descuentoFRL,
        valorSeguroPorEnfermedad: req.body.valorSeguroPorEnfermedad,
        descuentoSeguroPorEnfermedad: req.body.descuentoSeguroPorEnfermedad,
        valorAdicionalSNIS: req.body.valorAdicionalSNIS,
        descuentoSNIS: req.body.descuentoSNIS,
        irpf: req.body.irpf,
        totalDescuentos: req.body.totalDescuentos,
        liquidoCobrar: req.body.liquidoCobrar,
        diasGozarSV: req.body.diasGozarSV,
        montoDiaSV: req.body.montoDiaSV,
        egresoAguinaldo: req.body.egresoAguinaldo,
        egresoLicenciaNoGozada: req.body.egresoLicenciaNoGozada,
        egresoSV: req.body.egresoSV,
        egresoIPD: req.body.egresoIPD,
        egresoAlicuotaAguinaldo: req.body.egresoAlicuotaAguinaldo,
        egresoAlicuotaLicencia: req.body.egresoAlicuotaLicencia,
        egresoAlicuotaSV: req.body.egresoAlicuotaSV,
        fechaLiquidacion: new Date()
    });
    liquidacion.save(function(err){
        if(err){
            res.json({
                exito: false,
                mensaje: err
            });
        }
        else{
            res.json({
                exito: true,
                mensaje: "Liquidación creada"
            });
        }
    });
};

exports.editarLiquidacion = function(req, res){
    var dateMesAnio = new Date(req.body.anio, req.body.mes - 1);
    var query = { _id: req.body.id };
    Liquidacion.findOneAndUpdate(query, {
        empresa: req.body.empresa,
        nombre: req.body.nombre,
        mes: req.body.mes,
        anio: req.body.anio,
        mesAnio: dateMesAnio,
        empleadoId: req.body.empleadoId,
        empleadoCi: req.body.empleadoCi,
        empleado: req.body.empleado,
        sueldo: req.body.sueldo,
        cantidadFaltas: req.body.cantidadFaltas,
        descuentoFaltas: req.body.descuentoFaltas,
        cantidadHorasExtra: req.body.cantidadHorasExtra,
        montoHorasExtra: req.body.montoHorasExtra,
        montoFictoPropina: req.body.montoFictoPropina,
        cantidadDescansoTrabajado: req.body.cantidadDescansoTrabajado,
        montoDescansoTrabajado : req.body.montoDescansoTrabajado,
        cantidadFeriadoPago: req.body.cantidadFeriadoPago,
        montoFeriadoPago: req.body.montoFeriadoPago,
        montoPrimaPorAntiguedad: req.body.montoPrimaPorAntiguedad,
        montoPrimaPorProductividad: req.body.montoPrimaPorProductividad,
        totalHaberesGravados: req.body.totalHaberesGravados,
        totalHaberes: req.body.totalHaberes,
        montoAdelantos: req.body.montoAdelantos,
        montoRetenciones: req.body.montoRetenciones,
        valorAporteJubilatorio: req.body.valorAporteJubilatorio,
        descuentoAporteJubilatorio: req.body.descuentoAporteJubilatorio,
        valorFRL: req.body.valorFRL,
        descuentoFRL: req.body.descuentoFRL,
        valorSeguroPorEnfermedad: req.body.valorSeguroPorEnfermedad,
        descuentoSeguroPorEnfermedad: req.body.descuentoSeguroPorEnfermedad,
        valorAdicionalSNIS: req.body.valorAdicionalSNIS,
        descuentoSNIS: req.body.descuentoSNIS,
        irpf: req.body.irpf,
        totalDescuentos: req.body.totalDescuentos,
        liquidoCobrar: req.body.liquidoCobrar,
        diasGozarSV: req.body.diasGozarSV,
        montoDiaSV: req.body.montoDiaSV,
        egresoAguinaldo: req.body.egresoAguinaldo,
        egresoLicenciaNoGozada: req.body.egresoLicenciaNoGozada,
        egresoSV: req.body.egresoSV,
        egresoIPD: req.body.egresoIPD,
        egresoAlicuotaAguinaldo: req.body.egresoAlicuotaAguinaldo,
        egresoAlicuotaLicencia: req.body.egresoAlicuotaLicencia,
        egresoAlicuotaSV: req.body.egresoAlicuotaSV,
        fechaLiquidacion: new Date()
    }, function(err, liquidacion){
        if(err){
            res.json({
                exito: false,
                mensaje: err
            });
        }
        else{
            res.json({
                exito: true,
                mensaje: "Liquidación editada"
            });
        }
    });
};

exports.buscarLiquidacion = function(req, res){
    console.log("parámetros: " + req);
    if(req.params.nombre == "Sueldo"){
        Liquidacion.findOne({
            empresa: req.params.empresa,
            nombre: req.params.nombre,
            mes: req.params.mes,
            anio: req.params.anio,
            empleadoId: req.params.empleadoId
        }, function(err, liquidacion){
                if(err){
                    res.send(err);
                    console.log(err);
                }
                else{
                    res.json({
                        exito: true,
                        nombreLiquidacion: "Sueldo",
                        info: liquidacion
                    });
                    console.log("Liquidacion: " + liquidacion);
                }
            }
        );
    }
    if(req.params.nombre == "Aguinaldo"){
        if(req.params.mes == 6 || req.params.mes == 12){
            Liquidacion.findOne({
                empresa: req.params.empresa,
                nombre: req.params.nombre,
                mes: req.params.mes,
                anio: req.params.anio,
                empleadoId: req.params.empleadoId
            }, function(err, liquidacion){
                    if(err){
                        res.send(err);
                        console.log(err);
                    }
                    else{
                        res.json({
                            exito: true,
                            nombreLiquidacion: "Aguinaldo",
                            info: liquidacion
                        });
                        console.log("Liquidacion: " + liquidacion);
                    }
                }
            );
        }
        else{
            res.json({
                exito: false,
                nombreLiquidacion: "Aguinaldo",
                info: "El aguinaldo se puede calcular solo en los meses 6 y 12"
            });
        }
    }
    if(req.params.nombre == "Salario Vacacional"){
        Liquidacion.findOne({
            empresa: req.params.empresa,
            nombre: req.params.nombre,
            mes: req.params.mes,
            anio: req.params.anio,
            empleadoId: req.params.empleadoId
        }, function(err, liquidacion){
                if(err){
                    res.send(err);
                    console.log(err);
                }
                else{
                    res.json({
                        exito: true,
                        nombreLiquidacion: "Salario Vacacional",
                        info: liquidacion
                    });
                    console.log("Liquidacion: " + liquidacion);
                }
            }
        );
    }
    if(req.params.nombre == "Egreso"){
        // En este caso busco todas y en el front pregunto si fecha de ingreso de empleado es mayor a la fecha de egreso de la/s encontrada/s
        Liquidacion.find({
            empresa: req.params.empresa,
            nombre: req.params.nombre,
            empleadoId: req.params.empleadoId
        },  function(err, liquidaciones){
                if(err){
                    res.send(err);
                    console.log(err);
                }
                else{
                    res.json({
                        exito: true,
                        nombreLiquidacion: "Egreso",
                        info: liquidaciones
                    });
                    console.log("Liquidacion/es: " + liquidaciones);
                }
            }
        );
    }
};

exports.imprimirRecibos = function(req, res){
    var doc = new PDFDocument({
        size: "A4",
        autoFirstPage: false,
        margins: {
            top: 72, 
            bottom: 18,
            left: 72,
            right: 18
        }
    }); 

    var liquidaciones = req.body.liquidaciones;
    var empresa = {};

    var queryEmpresa = { nombre: req.body.empresa };
    Empresa.findOne(queryEmpresa, 
        function(err, empresaLiq){
            if(err){
                empresa = {};
            }
            else{
                if(empresaLiq != null){
                    empresa = empresaLiq;
                    liquidaciones.forEach(function(liq){
                        console.log(empresa);
                        console.log(liq.empleado);

                        doc.addPage();

                        doc.moveTo(350, 38)
                        .lineTo(580, 38)
                        .stroke();  

                        doc.moveTo(20, 95)
                        .lineTo(30, 95)
                        .stroke();

                        doc.moveTo(150, 95)
                        .lineTo(580, 95)
                        .stroke();   

                        doc.moveTo(20, 148)
                        .lineTo(580, 148)
                        .stroke();

                        doc.moveTo(20, 163)
                        .lineTo(580, 163)
                        .stroke();

                        doc.moveTo(280, 163)
                        .lineTo(280, 300)
                        .stroke();

                        doc.moveTo(20, 300)
                        .lineTo(580, 300)
                        .stroke();

                        doc.moveTo(20, 312)
                        .lineTo(580, 312)
                        .stroke();

                        doc.moveTo(420, 375)
                        .lineTo(580, 375)
                        .stroke();

                        doc.x = 20;
                        doc.y = 20;
                        doc.fillColor('black')
                        doc.fontSize(16);
                        doc.text(empresa.razonSocial, {
                            align: "left",
                        });

                        doc.x = 20;
                        doc.y = 45;
                        doc.fillColor('black')
                        doc.fontSize(9);
                        doc.text("Dirección: " + empresa.direccion, {
                            align: "left",
                        });

                        doc.x = 20;
                        doc.y = 60;
                        doc.fillColor('black')
                        doc.fontSize(9);
                        doc.text("RUT: " + empresa.numRut, {
                            align: "left",
                        });

                        doc.x = 20;
                        doc.y = 75;
                        doc.fillColor('black')
                        doc.fontSize(9);
                        doc.text("BPS: " + empresa.numBps, {
                            align: "left",
                        });

                        doc.x = 250;
                        doc.y = 45;
                        doc.fillColor('black')
                        doc.fontSize(9);
                        doc.text("BSE: " + empresa.numBps, {
                            align: "left",
                        });

                        doc.x = 250;
                        doc.y = 60;
                        doc.fillColor('black')
                        doc.fontSize(9);
                        doc.text("MTSS: " + empresa.numMtss, {
                            align: "left",
                        });

                        doc.x = 250;
                        doc.y = 75;
                        doc.fillColor('black')
                        doc.fontSize(9);
                        doc.text("Grupo - Subgrupo: " + empresa.grupo + " - " + empresa.subgrupo , {
                            align: "left",
                        });

                        doc.x = 400;
                        doc.y = 50;
                        doc.fillColor('black')
                        doc.fontSize(11);
                        doc.text("Fecha: " + liq.mes + "-" + liq.anio, {
                            align: "right",
                        });

                        doc.x = 400;
                        doc.y = 70;
                        doc.fillColor('black')
                        doc.fontSize(11);
                        doc.text("Liquidación: " + liq.nombre, {
                            align: "right",
                        });

                        doc.x = 44;
                        doc.y = 92;
                        doc.fillColor('black')
                        doc.fontSize(10);
                        doc.text("Datos del empleado", {
                            align: "left",
                        });

                        doc.x = 20;
                        doc.y = 105;
                        doc.fillColor('black')
                        doc.fontSize(8);
                        doc.text("Nombres: " + liq.empleado.nombres, {
                            align: "left",
                        });

                        doc.x = 20;
                        doc.y = 120;
                        doc.fillColor('black')
                        doc.fontSize(8);
                        doc.text("Apellidos: " + liq.empleado.apellidos, {
                            align: "left",
                        });

                        doc.x = 20;
                        doc.y = 135;
                        doc.fillColor('black')
                        doc.fontSize(8);
                        doc.text("C.I.: " + liq.empleado.ci, {
                            align: "left",
                        });

                        doc.x = 175;
                        doc.y = 105;
                        doc.fillColor('black')
                        doc.fontSize(8);
                        doc.text("Sector: Sector único", {
                            align: "left",
                        });

                        doc.x = 175;
                        doc.y = 120;
                        doc.fillColor('black')
                        doc.fontSize(8);
                        doc.text("Cargo: " + liq.empleado.cargo, {
                            align: "left",
                        });

                        doc.x = 175;
                        doc.y = 135;
                        doc.fillColor('black')
                        doc.fontSize(8);
                        doc.text("Horario: " + liq.empleado.horario, {
                            align: "left",
                        });

                        doc.x = 325;
                        doc.y = 105;
                        doc.fillColor('black')
                        doc.fontSize(8);
                        doc.text("Banco: " + liq.empleado.banco, {
                            align: "left",
                        });

                        doc.x = 325;
                        doc.y = 120;
                        doc.fillColor('black')
                        doc.fontSize(8);
                        doc.text("Sucursal Banco: " + liq.empleado.numSucursalBanco, {
                            align: "left",
                        });

                        doc.x = 325;
                        doc.y = 135;
                        doc.fillColor('black')
                        doc.fontSize(8);
                        doc.text("Nº de cuenta: " + liq.empleado.numCuentaBanco, {
                            align: "left",
                        });

                        var fechaIngreso = new Date(liq.empleado.fechaIngreso);
                        doc.x = 450;
                        doc.y = 112;
                        doc.fillColor('black')
                        doc.fontSize(8);
                        doc.text("Fecha ingreso: " + (fechaIngreso.getDate() + "-" +  (fechaIngreso.getMonth()+1) + "-" + fechaIngreso.getFullYear()), {
                            align: "left",
                        });

                        if(liq.empleado.fechaEgreso != null){
                            var fechaEgreso = new Date(liq.empleado.fechaEgreso);
                            var fechaEgresoMes = fechaEgreso.getMonth() + 1;
                            console.log("fechaEgresoMes: " + fechaEgresoMes)
                            doc.x = 450;
                            doc.y = 127;
                            doc.fillColor('black')
                            doc.fontSize(8);
                            doc.text("Fecha egreso: " + fechaEgreso.getDate() + "-" + fechaEgresoMes + "-" + fechaEgreso.getFullYear(), {
                                align: "left",
                            });
                        }
                        else{
                            doc.x = 450;
                            doc.y = 127;
                            doc.fillColor('black')
                            doc.fontSize(8);
                            doc.text("Fecha egreso: ", {
                                align: "left",
                            });
                        }

                        doc.x = 45;
                        doc.y = 152;
                        doc.fillColor('black')
                        doc.fontSize(11);
                        doc.text("HABERES", {
                            align: "left",
                        });

                        doc.x = 320;
                        doc.y = 152;
                        doc.fillColor('black')
                        doc.fontSize(11);
                        doc.text("DESCUENTOS", {
                            align: "left",
                        });

                        var alturaHaberes = 170;
                        doc.x = 25;
                        doc.y = alturaHaberes;
                        doc.fillColor('black')
                        doc.fontSize(10);
                        doc.text("Nombre", {
                            align: "left",
                        });

                        doc.x = 160;
                        doc.y = alturaHaberes;
                        doc.fillColor('black')
                        doc.fontSize(10);
                        doc.text("Detalle", {
                            align: "left",
                        });

                        doc.x = 230;
                        doc.y = alturaHaberes;
                        doc.fillColor('black')
                        doc.fontSize(10);
                        doc.text("Importe", {
                            align: "left",
                        });

                        var alturaDescuentos = 170;
                        doc.x = 290;
                        doc.y = alturaDescuentos;
                        doc.fillColor('black')
                        doc.fontSize(10);
                        doc.text("Nombre", {
                            align: "left",
                        });

                        doc.x = 425;
                        doc.y = alturaDescuentos;
                        doc.fillColor('black')
                        doc.fontSize(10);
                        doc.text("Detalle", {
                            align: "left",
                        });

                        doc.x = 500;
                        doc.y = alturaDescuentos;
                        doc.fillColor('black')
                        doc.fontSize(10);
                        doc.text("Importe", {
                            align: "left",
                        });

                        if(liq.nombre == "Sueldo"){
                            alturaHaberes = alturaHaberes + 12;
                            doc.x = 25;
                            doc.y = alturaHaberes;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text("Sueldo", {
                                align: "left",
                            });
                    
                            doc.x = 160;
                            doc.y = alturaHaberes;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text("", {
                                align: "center",
                                width: 25,
                            });
                    
                            doc.x = 220;
                            doc.y = alturaHaberes;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text(liq.sueldo, {
                                align: "right",
                                width: 45,
                            });
                            
                            if(liq.cantidadFaltas != null){
                                if(liq.cantidadFaltas != 0){
                                    alturaHaberes = alturaHaberes + 12;
                                    doc.x = 25;
                                    doc.y = alturaHaberes;
                                    doc.fillColor('black')
                                    doc.fontSize(9);
                                    doc.text("Faltas", {
                                        align: "left",
                                    });
                            
                                    doc.x = 160;
                                    doc.y = alturaHaberes;
                                    doc.fillColor('black')
                                    doc.fontSize(9);
                                    doc.text(liq.cantidadFaltas, {
                                        align: "center",
                                        width: 25,
                                    });
                            
                                    doc.x = 220;
                                    doc.y = alturaHaberes;
                                    doc.fillColor('black')
                                    doc.fontSize(9);
                                    doc.text("- " + liq.descuentoFaltas, {
                                        align: "right",
                                        width: 45,
                                    });
                                }
                            }
                            
                            if(liq.cantidadHorasExtra != null){
                                if(liq.cantidadHorasExtra != 0){
                                    alturaHaberes = alturaHaberes + 12;
                                    doc.x = 25;
                                    doc.y = alturaHaberes;
                                    doc.fillColor('black')
                                    doc.fontSize(9);
                                    doc.text("Horas Extra", {
                                        align: "left",
                                    });
                            
                                    doc.x = 160;
                                    doc.y = alturaHaberes;
                                    doc.fillColor('black')
                                    doc.fontSize(9);
                                    doc.text(liq.cantidadHorasExtra, {
                                        align: "center",
                                        width: 25,
                                    });
                            
                                    doc.x = 220;
                                    doc.y = alturaHaberes;
                                    doc.fillColor('black')
                                    doc.fontSize(9);
                                    doc.text(liq.montoHorasExtra, {
                                        align: "right",
                                        width: 45,
                                    });
                                }
                            }
                            
                            if(liq.montoFictoPropina != null){
                                if(liq.montoFictoPropina != 0){
                                    alturaHaberes = alturaHaberes + 12;
                                    doc.x = 25;
                                    doc.y = alturaHaberes;
                                    doc.fillColor('black')
                                    doc.fontSize(9);
                                    doc.text("Ficto Propina", {
                                        align: "left",
                                    });
                            
                                    doc.x = 160;
                                    doc.y = alturaHaberes;
                                    doc.fillColor('black')
                                    doc.fontSize(9);
                                    doc.text("", {
                                        align: "center",
                                        width: 25,
                                    });
                            
                                    doc.x = 220;
                                    doc.y = alturaHaberes;
                                    doc.fillColor('black')
                                    doc.fontSize(9);
                                    doc.text(liq.montoFictoPropina, {
                                        align: "right",
                                        width: 45,
                                    });
                                }
                            }
                            
                            if(liq.montoDescansoTrabajado != null && liq.montoDescansoTrabajado != 0){
                                alturaHaberes = alturaHaberes + 12;
                                doc.x = 25;
                                doc.y = alturaHaberes;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Descanso Trabajado", {
                                    align: "left",
                                });
                        
                                doc.x = 160;
                                doc.y = alturaHaberes;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("1", {
                                    align: "center",
                                    width: 25,
                                });
                        
                                doc.x = 220;
                                doc.y = alturaHaberes;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("1000", {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.montoFeriadoPago != null && liq.montoFeriadoPago != 0){
                                alturaHaberes = alturaHaberes + 12;
                                doc.x = 25;
                                doc.y = alturaHaberes;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Feriado Pago", {
                                    align: "left",
                                });
                        
                                doc.x = 160;
                                doc.y = alturaHaberes;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.cantidadFeriadoPago, {
                                    align: "center",
                                    width: 25,
                                });
                        
                                doc.x = 220;
                                doc.y = alturaHaberes;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.montoFeriadoPago, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.montoPrimaPorAntiguedad != null && liq.montoPrimaPorAntiguedad != 0){
                                alturaHaberes = alturaHaberes + 12;
                                doc.x = 25;
                                doc.y = alturaHaberes;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Prima por Antigüedad", {
                                    align: "left",
                                });
                        
                                doc.x = 160;
                                doc.y = alturaHaberes;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("", {
                                    align: "center",
                                    width: 25,
                                });
                        
                                doc.x = 220;
                                doc.y = alturaHaberes;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.montoPrimaPorAntiguedad, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.montoPrimaPorProductividad != null && liq.montoPrimaPorProductividad != 0){
                                alturaHaberes = alturaHaberes + 12;
                                doc.x = 25;
                                doc.y = alturaHaberes;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Prima por Productividad", {
                                    align: "left",
                                });
                        
                                doc.x = 160;
                                doc.y = alturaHaberes;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("", {
                                    align: "center",
                                    width: 25,
                                });
                        
                                doc.x = 220;
                                doc.y = alturaHaberes;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(lqi.montoPrimaPorProductividad, {
                                    align: "right",
                                    width: 45,
                                });
                            }   

                            if(liq.descuentoAporteJubilatorio != null && liq.descuentoAporteJubilatorio != 0){
                                alturaDescuentos = alturaDescuentos + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Aporte Jubilatorio", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.valorAporteJubilatorio + "%", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.descuentoAporteJubilatorio, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.descuentoFRL != null && liq.descuentoFRL != 0){
                                alturaDescuentos = alturaDescuentos + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("FRL", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.valorFRL + "%", {
                                    align: "center",
                                    width: 35,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.descuentoFRL, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.descuentoSeguroPorEnfermedad != null && liq.descuentoSeguroPorEnfermedad != 0){
                                alturaDescuentos = alturaDescuentos + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Seguro por Enfermedad", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.valorSeguroPorEnfermedad + "%", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.descuentoSeguroPorEnfermedad, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.valorAdicionalSNIS != null && liq.valorAdicionalSNIS != 0){
                                alturaDescuentos = alturaDescuentos + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Adicional SNIS", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.valorAdicionalSNIS + "%", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.descuentoSNIS, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.irpf != null){
                                alturaDescuentos = alturaDescuentos + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("IRPF", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.irpf, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.montoAdelantos != null && liq.montoAdelantos != 0){
                                alturaDescuentos = alturaDescuentos + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Adelantos", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.montoAdelantos, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.montoRetenciones != null && liq.montoRetenciones != 0){
                                alturaDescuentos = alturaDescuentos + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Retenciones", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.montoRetenciones, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                        }

                        if(liq.nombre == "Aguinaldo"){
                            alturaHaberes = alturaHaberes + 12;
                            doc.x = 25;
                            doc.y = alturaHaberes;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text("Aguinaldo", {
                                align: "left",
                            });
                    
                            doc.x = 160;
                            doc.y = alturaHaberes;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text("", {
                                align: "center",
                                width: 25,
                            });
                    
                            doc.x = 220;
                            doc.y = alturaHaberes;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text(liq.totalHaberesGravados, {
                                align: "right",
                                width: 45,
                            });

                            if(liq.descuentoAporteJubilatorio != null && liq.descuentoAporteJubilatorio != 0){
                                alturaDescuentos = alturaDescuentos + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Aporte Jubilatorio", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.valorAporteJubilatorio + "%", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.descuentoAporteJubilatorio, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.descuentoFRL != null && liq.descuentoFRL != 0){
                                alturaDescuentos = alturaDescuentos + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("FRL", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.valorFRL + "%", {
                                    align: "center",
                                    width: 35,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.descuentoFRL, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.descuentoSeguroPorEnfermedad != null && liq.descuentoSeguroPorEnfermedad != 0){
                                alturaDescuentos = alturaDescuentos + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Seguro por Enfermedad", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.valorSeguroPorEnfermedad + "%", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.descuentoSeguroPorEnfermedad, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.valorAdicionalSNIS != null && liq.valorAdicionalSNIS != 0){
                                alturaDescuentos = alturaDescuentos + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Adicional SNIS", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.valorAdicionalSNIS + "%", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.descuentoSNIS, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.montoAdelantos != null && liq.montoAdelantos != 0){
                                alturaDescuentos = alturaDescuentos + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Adelantos", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.montoAdelantos, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.montoRetenciones != null && liq.montoRetenciones != 0){
                                alturaDescuentos = alturaDescuentos + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Retenciones", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.montoRetenciones, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                        }

                        if(liq.nombre == "Salario Vacacional"){
                            alturaHaberes = alturaHaberes + 12;
                            doc.x = 25;
                            doc.y = alturaHaberes;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text("Salario Vacacional", {
                                align: "left",
                            });
                    
                            doc.x = 160;
                            doc.y = alturaHaberes;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text(liq.diasGozarSV + " x " + liq.montoDiaSV, {
                                align: "center",
                                width: 60,
                            });
                    
                            doc.x = 220;
                            doc.y = alturaHaberes;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text(liq.totalHaberes, {
                                align: "right",
                                width: 45,
                            });
                            
                            if(liq.montoAdelantos != null && liq.montoAdelantos != 0){
                                alturaDescuentos = alturaDescuentos + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Adelantos", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.montoAdelantos, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.montoRetenciones != null && liq.montoRetenciones != 0){
                                alturaDescuentos = alturaDescuentos + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Retenciones", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.montoRetenciones, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                        }

                        if(liq.nombre == "Egreso"){
                            alturaHaberes = alturaHaberes + 12;
                            doc.x = 25;
                            doc.y = alturaHaberes;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text("Licencia no gozada", {
                                align: "left",
                            });
                    
                            doc.x = 160;
                            doc.y = alturaHaberes;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text("", {
                                align: "center",
                                width: 25,
                            });
                    
                            doc.x = 220;
                            doc.y = alturaHaberes;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text(liq.egresoLicenciaNoGozada, {
                                align: "right",
                                width: 45,
                            });
                            
                           
                            alturaHaberes = alturaHaberes + 12;
                            doc.x = 25;
                            doc.y = alturaHaberes;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text("Sal. Vac. por egreso", {
                                align: "left",
                            });
                    
                            doc.x = 160;
                            doc.y = alturaHaberes;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text("", {
                                align: "center",
                                width: 25,
                            });
                    
                            doc.x = 220;
                            doc.y = alturaHaberes;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text(liq.egresoSV, {
                                align: "right",
                                width: 45,
                            });

                            
                            alturaHaberes = alturaHaberes + 12;
                            doc.x = 25;
                            doc.y = alturaHaberes;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text("Aguinaldo", {
                                align: "left",
                            });
                    
                            doc.x = 160;
                            doc.y = alturaHaberes;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text("", {
                                align: "center",
                                width: 25,
                            });
                    
                            doc.x = 220;
                            doc.y = alturaHaberes;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text(liq.totalHaberesGravados, {
                                align: "right",
                                width: 45,
                            });
                            
                            if(liq.egresoIPD != 0){
                                alturaHaberes = alturaHaberes + 12;
                                doc.x = 25;
                                doc.y = alturaHaberes;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Indemn. por despido", {
                                    align: "left",
                                });
                        
                                doc.x = 160;
                                doc.y = alturaHaberes;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("", {
                                    align: "center",
                                    width: 25,
                                });
                        
                                doc.x = 220;
                                doc.y = alturaHaberes;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.egresoIPD, {
                                    align: "right",
                                    width: 45,
                                });

                                alturaHaberes = alturaHaberes + 12;
                                doc.x = 25;
                                doc.y = alturaHaberes;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Alícuota IPD Aguinaldo", {
                                    align: "left",
                                });
                        
                                doc.x = 160;
                                doc.y = alturaHaberes;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("", {
                                    align: "center",
                                    width: 25,
                                });
                        
                                doc.x = 220;
                                doc.y = alturaHaberes;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.egresoAlicuotaAguinaldo, {
                                    align: "right",
                                    width: 45,
                                });

                                alturaHaberes = alturaHaberes + 12;
                                doc.x = 25;
                                doc.y = alturaHaberes;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Alícuota IPD Licencia ", {
                                    align: "left",
                                });
                        
                                doc.x = 160;
                                doc.y = alturaHaberes;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("", {
                                    align: "center",
                                    width: 25,
                                });
                        
                                doc.x = 220;
                                doc.y = alturaHaberes;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.egresoAlicuotaLicencia, {
                                    align: "right",
                                    width: 45,
                                });

                                alturaHaberes = alturaHaberes + 12;
                                doc.x = 25;
                                doc.y = alturaHaberes;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Alícuoua IPD SV", {
                                    align: "left",
                                });
                        
                                doc.x = 160;
                                doc.y = alturaHaberes;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("", {
                                    align: "center",
                                    width: 25,
                                });
                        
                                doc.x = 220;
                                doc.y = alturaHaberes;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.egresoAlicuotaSV, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.descuentoAporteJubilatorio != null && liq.descuentoAporteJubilatorio != 0){
                                alturaDescuentos = alturaDescuentos + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Aporte Jubilatorio", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.valorAporteJubilatorio + "%", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.descuentoAporteJubilatorio, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.descuentoFRL != null && liq.descuentoFRL != 0){
                                alturaDescuentos = alturaDescuentos + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("FRL", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.valorFRL + "%", {
                                    align: "center",
                                    width: 35,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.descuentoFRL, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.descuentoSeguroPorEnfermedad != null && liq.descuentoSeguroPorEnfermedad != 0){
                                alturaDescuentos = alturaDescuentos + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Seguro por Enfermedad", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.valorSeguroPorEnfermedad + "%", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.descuentoSeguroPorEnfermedad, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.valorAdicionalSNIS != null && liq.valorAdicionalSNIS != 0){
                                alturaDescuentos = alturaDescuentos + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Adicional SNIS", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.valorAdicionalSNIS + "%", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.descuentoSNIS, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.irpf != null){
                                alturaDescuentos = alturaDescuentos + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("IRPF", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.irpf, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.montoAdelantos != null && liq.montoAdelantos != 0){
                                alturaDescuentos = alturaDescuentos + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Adelantos", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.montoAdelantos, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.montoRetenciones != null && liq.montoRetenciones != 0){
                                alturaDescuentos = alturaDescuentos + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Retenciones", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentos;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.montoRetenciones, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                        }

                        doc.x = 25;
                        doc.y = 303;
                        doc.fillColor('black')
                        doc.fontSize(9);
                        doc.text("Total Gravado: " + liq.totalHaberesGravados, {
                            align: "left",
                        });
                        
                        doc.x = 150;
                        doc.y = 303;
                        doc.fillColor('black')
                        doc.fontSize(9);
                        doc.text("Total de Haberes: " + liq.totalHaberes, {
                            align: "left",
                        });

                        doc.x = 400;
                        doc.y = 303;
                        doc.fillColor('black')
                        doc.fontSize(9);
                        doc.text("Total de Descuentos: " + liq.totalDescuentos, {
                            align: "right",
                        });

                        doc.x = 400;
                        doc.y = 340;
                        doc.font("Helvetica-Bold")
                        doc.fillColor('black')
                        doc.fontSize(11);
                        doc.text("Líquido a Cobrar: " + liq.liquidoCobrar, {
                            align: "right",
                        });

                        doc.x = 490;
                        doc.y = 378;
                        doc.font("Helvetica")
                        doc.fillColor('black')
                        doc.fontSize(7);
                        doc.text("Firma", {
                            align: "left",
                        });

                        //Copiar la parte de abajo
                        var copia = 420; 

                        doc.moveTo(350, 38 + copia)
                        .lineTo(580, 38 + copia)
                        .stroke();  

                        doc.moveTo(20, 95+ copia)
                        .lineTo(30, 95+ copia)
                        .stroke();

                        doc.moveTo(150, 95+ copia)
                        .lineTo(580, 95+ copia)
                        .stroke();   

                        doc.moveTo(20, 148+ copia)
                        .lineTo(580, 148+ copia)
                        .stroke();

                        doc.moveTo(20, 163+ copia)
                        .lineTo(580, 163+ copia)
                        .stroke();

                        doc.moveTo(280, 163+ copia)
                        .lineTo(280, 300+ copia)
                        .stroke();

                        doc.moveTo(20, 300+ copia)
                        .lineTo(580, 300+ copia)
                        .stroke();

                        doc.moveTo(20, 312+ copia)
                        .lineTo(580, 312+ copia)
                        .stroke();

                        doc.moveTo(420, 375+ copia)
                        .lineTo(580, 375+ copia)
                        .stroke();

                        doc.x = 20;
                        doc.y = 20 + copia;
                        doc.fillColor('black')
                        doc.fontSize(16);
                        doc.text(empresa.razonSocial, {
                            align: "left",
                        });

                        doc.x = 20;
                        doc.y = 45+ copia;
                        doc.fillColor('black')
                        doc.fontSize(9);
                        doc.text("Dirección: " + empresa.direccion, {
                            align: "left",
                        });

                        doc.x = 20;
                        doc.y = 60+ copia;
                        doc.fillColor('black')
                        doc.fontSize(9);
                        doc.text("RUT: " + empresa.numRut, {
                            align: "left",
                        });

                        doc.x = 20;
                        doc.y = 75+ copia;
                        doc.fillColor('black')
                        doc.fontSize(9);
                        doc.text("BPS: " + empresa.numBps, {
                            align: "left",
                        });

                        doc.x = 250;
                        doc.y = 45+ copia;
                        doc.fillColor('black')
                        doc.fontSize(9);
                        doc.text("BSE: " + empresa.numBps, {
                            align: "left",
                        });

                        doc.x = 250;
                        doc.y = 60+ copia;
                        doc.fillColor('black')
                        doc.fontSize(9);
                        doc.text("MTSS: " + empresa.numMtss, {
                            align: "left",
                        });

                        doc.x = 250;
                        doc.y = 75+ copia;
                        doc.fillColor('black')
                        doc.fontSize(9);
                        doc.text("Grupo - Subgrupo: " + empresa.grupo + " - " + empresa.subgrupo , {
                            align: "left",
                        });

                        doc.x = 400;
                        doc.y = 50+ copia;
                        doc.fillColor('black')
                        doc.fontSize(11);
                        doc.text("Fecha: " + liq.mes + "-" + liq.anio, {
                            align: "right",
                        });

                        doc.x = 400;
                        doc.y = 70+ copia;
                        doc.fillColor('black')
                        doc.fontSize(11);
                        doc.text("Liquidación: " + liq.nombre, {
                            align: "right",
                        });

                        doc.x = 44;
                        doc.y = 92+ copia;
                        doc.fillColor('black')
                        doc.fontSize(10);
                        doc.text("Datos del empleado", {
                            align: "left",
                        });

                        doc.x = 20;
                        doc.y = 105+ copia;
                        doc.fillColor('black')
                        doc.fontSize(8);
                        doc.text("Nombres: " + liq.empleado.nombres, {
                            align: "left",
                        });

                        doc.x = 20;
                        doc.y = 120+ copia;
                        doc.fillColor('black')
                        doc.fontSize(8);
                        doc.text("Apellidos: " + liq.empleado.apellidos, {
                            align: "left",
                        });

                        doc.x = 20;
                        doc.y = 135+ copia;
                        doc.fillColor('black')
                        doc.fontSize(8);
                        doc.text("C.I.: " + liq.empleado.ci, {
                            align: "left",
                        });

                        doc.x = 175;
                        doc.y = 105+ copia;
                        doc.fillColor('black')
                        doc.fontSize(8);
                        doc.text("Sector: Sector único", {
                            align: "left",
                        });

                        doc.x = 175;
                        doc.y = 120+ copia;
                        doc.fillColor('black')
                        doc.fontSize(8);
                        doc.text("Cargo: " + liq.empleado.cargo, {
                            align: "left",
                        });

                        doc.x = 175;
                        doc.y = 135+ copia;
                        doc.fillColor('black')
                        doc.fontSize(8);
                        doc.text("Horario: " + liq.empleado.horario, {
                            align: "left",
                        });

                        doc.x = 325;
                        doc.y = 105+ copia;
                        doc.fillColor('black')
                        doc.fontSize(8);
                        doc.text("Banco: " + liq.empleado.banco, {
                            align: "left",
                        });

                        doc.x = 325;
                        doc.y = 120+ copia;
                        doc.fillColor('black')
                        doc.fontSize(8);
                        doc.text("Sucursal Banco: " + liq.empleado.numSucursalBanco, {
                            align: "left",
                        });

                        doc.x = 325;
                        doc.y = 135+ copia;
                        doc.fillColor('black')
                        doc.fontSize(8);
                        doc.text("Nº de cuenta: " + liq.empleado.numCuentaBanco, {
                            align: "left",
                        });

                        doc.x = 450;
                        doc.y = 112+ copia;
                        doc.fillColor('black')
                        doc.fontSize(8);
                        doc.text("Fecha ingreso: " + (fechaIngreso.getDate() + "-" +  (fechaIngreso.getMonth()+1) + "-" + fechaIngreso.getFullYear()), {
                            align: "left",
                        });

                        if(liq.empleado.fechaEgreso != null){;
                            console.log("fechaEgresoMes: " + fechaEgresoMes)
                            doc.x = 450;
                            doc.y = 127+ copia;
                            doc.fillColor('black')
                            doc.fontSize(8);
                            doc.text("Fecha egreso: " + fechaEgreso.getDate() + "-" + fechaEgresoMes + "-" + fechaEgreso.getFullYear(), {
                                align: "left",
                            });
                        }
                        else{
                            doc.x = 450;
                            doc.y = 127+ copia;
                            doc.fillColor('black')
                            doc.fontSize(8);
                            doc.text("Fecha egreso: ", {
                                align: "left",
                            });
                        }

                        doc.x = 45;
                        doc.y = 152+ copia;
                        doc.fillColor('black')
                        doc.fontSize(11);
                        doc.text("HABERES", {
                            align: "left",
                        });

                        doc.x = 320;
                        doc.y = 152+ copia;
                        doc.fillColor('black')
                        doc.fontSize(11);
                        doc.text("DESCUENTOS", {
                            align: "left",
                        });

                        var alturaHaberesCopia = 170+ copia;
                        doc.x = 25;
                        doc.y = alturaHaberesCopia;
                        doc.fillColor('black')
                        doc.fontSize(10);
                        doc.text("Nombre", {
                            align: "left",
                        });

                        doc.x = 160;
                        doc.y = alturaHaberesCopia;
                        doc.fillColor('black')
                        doc.fontSize(10);
                        doc.text("Detalle", {
                            align: "left",
                        });

                        doc.x = 230;
                        doc.y = alturaHaberesCopia;
                        doc.fillColor('black')
                        doc.fontSize(10);
                        doc.text("Importe", {
                            align: "left",
                        });

                        var alturaDescuentosCopia = 170+ copia;
                        doc.x = 290;
                        doc.y = alturaDescuentosCopia;
                        doc.fillColor('black')
                        doc.fontSize(10);
                        doc.text("Nombre", {
                            align: "left",
                        });

                        doc.x = 425;
                        doc.y = alturaDescuentosCopia;
                        doc.fillColor('black')
                        doc.fontSize(10);
                        doc.text("Detalle", {
                            align: "left",
                        });

                        doc.x = 500;
                        doc.y = alturaDescuentosCopia;
                        doc.fillColor('black')
                        doc.fontSize(10);
                        doc.text("Importe", {
                            align: "left",
                        });

                        if(liq.nombre == "Sueldo"){
                            alturaHaberesCopia = alturaHaberesCopia + 12;
                            doc.x = 25;
                            doc.y = alturaHaberesCopia;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text("Sueldo", {
                                align: "left",
                            });
                    
                            doc.x = 160;
                            doc.y = alturaHaberesCopia;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text("", {
                                align: "center",
                                width: 25,
                            });
                    
                            doc.x = 220;
                            doc.y = alturaHaberesCopia;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text(liq.sueldo, {
                                align: "right",
                                width: 45,
                            });
                            
                            if(liq.cantidadFaltas != null){
                                if(liq.cantidadFaltas != 0){
                                    alturaHaberesCopia = alturaHaberesCopia + 12;
                                    doc.x = 25;
                                    doc.y = alturaHaberesCopia;
                                    doc.fillColor('black')
                                    doc.fontSize(9);
                                    doc.text("Faltas", {
                                        align: "left",
                                    });
                            
                                    doc.x = 160;
                                    doc.y = alturaHaberesCopia;
                                    doc.fillColor('black')
                                    doc.fontSize(9);
                                    doc.text(liq.cantidadFaltas, {
                                        align: "center",
                                        width: 25,
                                    });
                            
                                    doc.x = 220;
                                    doc.y = alturaHaberesCopia;
                                    doc.fillColor('black')
                                    doc.fontSize(9);
                                    doc.text("- " + liq.descuentoFaltas, {
                                        align: "right",
                                        width: 45,
                                    });
                                }
                            }
                            
                            if(liq.cantidadHorasExtra != null){
                                if(liq.cantidadHorasExtra != 0){
                                    alturaHaberesCopia = alturaHaberesCopia + 12;
                                    doc.x = 25;
                                    doc.y = alturaHaberesCopia;
                                    doc.fillColor('black')
                                    doc.fontSize(9);
                                    doc.text("Horas Extra", {
                                        align: "left",
                                    });
                            
                                    doc.x = 160;
                                    doc.y = alturaHaberesCopia;
                                    doc.fillColor('black')
                                    doc.fontSize(9);
                                    doc.text(liq.cantidadHorasExtra, {
                                        align: "center",
                                        width: 25,
                                    });
                            
                                    doc.x = 220;
                                    doc.y = alturaHaberesCopia;
                                    doc.fillColor('black')
                                    doc.fontSize(9);
                                    doc.text(liq.montoHorasExtra, {
                                        align: "right",
                                        width: 45,
                                    });
                                }
                            }
                            
                            if(liq.montoFictoPropina != null){
                                if(liq.montoFictoPropina != 0){
                                    alturaHaberesCopia = alturaHaberesCopia + 12;
                                    doc.x = 25;
                                    doc.y = alturaHaberesCopia;
                                    doc.fillColor('black')
                                    doc.fontSize(9);
                                    doc.text("Ficto Propina", {
                                        align: "left",
                                    });
                            
                                    doc.x = 160;
                                    doc.y = alturaHaberesCopia;
                                    doc.fillColor('black')
                                    doc.fontSize(9);
                                    doc.text("", {
                                        align: "center",
                                        width: 25,
                                    });
                            
                                    doc.x = 220;
                                    doc.y = alturaHaberesCopia;
                                    doc.fillColor('black')
                                    doc.fontSize(9);
                                    doc.text(liq.montoFictoPropina, {
                                        align: "right",
                                        width: 45,
                                    });
                                }
                            }
                            
                            if(liq.montoDescansoTrabajado != null && liq.montoDescansoTrabajado != 0){
                                alturaHaberesCopia = alturaHaberesCopia + 12;
                                doc.x = 25;
                                doc.y = alturaHaberesCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Descanso Trabajado", {
                                    align: "left",
                                });
                        
                                doc.x = 160;
                                doc.y = alturaHaberesCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("1", {
                                    align: "center",
                                    width: 25,
                                });
                        
                                doc.x = 220;
                                doc.y = alturaHaberesCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("1000", {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.montoFeriadoPago != null && liq.montoFeriadoPago != 0){
                                alturaHaberesCopia = alturaHaberesCopia + 12;
                                doc.x = 25;
                                doc.y = alturaHaberesCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Feriado Pago", {
                                    align: "left",
                                });
                        
                                doc.x = 160;
                                doc.y = alturaHaberesCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.cantidadFeriadoPago, {
                                    align: "center",
                                    width: 25,
                                });
                        
                                doc.x = 220;
                                doc.y = alturaHaberesCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.montoFeriadoPago, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.montoPrimaPorAntiguedad != null && liq.montoPrimaPorAntiguedad != 0){
                                alturaHaberesCopia = alturaHaberesCopia + 12;
                                doc.x = 25;
                                doc.y = alturaHaberesCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Prima por Antigüedad", {
                                    align: "left",
                                });
                        
                                doc.x = 160;
                                doc.y = alturaHaberesCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("", {
                                    align: "center",
                                    width: 25,
                                });
                        
                                doc.x = 220;
                                doc.y = alturaHaberesCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.montoPrimaPorAntiguedad, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.montoPrimaPorProductividad != null && liq.montoPrimaPorProductividad != 0){
                                alturaHaberesCopia = alturaHaberesCopia + 12;
                                doc.x = 25;
                                doc.y = alturaHaberesCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Prima por Productividad", {
                                    align: "left",
                                });
                        
                                doc.x = 160;
                                doc.y = alturaHaberesCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("", {
                                    align: "center",
                                    width: 25,
                                });
                        
                                doc.x = 220;
                                doc.y = alturaHaberesCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(lqi.montoPrimaPorProductividad, {
                                    align: "right",
                                    width: 45,
                                });
                            }   

                            if(liq.descuentoAporteJubilatorio != null && liq.descuentoAporteJubilatorio != 0){
                                alturaDescuentosCopia = alturaDescuentosCopia + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Aporte Jubilatorio", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.valorAporteJubilatorio + "%", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.descuentoAporteJubilatorio, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.descuentoFRL != null && liq.descuentoFRL != 0){
                                alturaDescuentosCopia = alturaDescuentosCopia + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("FRL", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.valorFRL + "%", {
                                    align: "center",
                                    width: 35,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.descuentoFRL, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.descuentoSeguroPorEnfermedad != null && liq.descuentoSeguroPorEnfermedad != 0){
                                alturaDescuentosCopia = alturaDescuentosCopia + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Seguro por Enfermedad", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.valorSeguroPorEnfermedad + "%", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.descuentoSeguroPorEnfermedad, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.valorAdicionalSNIS != null && liq.valorAdicionalSNIS != 0){
                                alturaDescuentosCopia = alturaDescuentosCopia + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Adicional SNIS", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.valorAdicionalSNIS + "%", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.descuentoSNIS, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.irpf != null){
                                alturaDescuentosCopia = alturaDescuentosCopia + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("IRPF", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.irpf, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.montoAdelantos != null && liq.montoAdelantos != 0){
                                alturaDescuentosCopia = alturaDescuentosCopia + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Adelantos", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.montoAdelantos, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.montoRetenciones != null && liq.montoRetenciones != 0){
                                alturaDescuentosCopia = alturaDescuentosCopia + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Retenciones", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.montoRetenciones, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                        }

                        if(liq.nombre == "Aguinaldo"){
                            alturaHaberesCopia = alturaHaberesCopia + 12;
                            doc.x = 25;
                            doc.y = alturaHaberesCopia;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text("Aguinaldo", {
                                align: "left",
                            });
                    
                            doc.x = 160;
                            doc.y = alturaHaberesCopia;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text("", {
                                align: "center",
                                width: 25,
                            });
                    
                            doc.x = 220;
                            doc.y = alturaHaberesCopia;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text(liq.totalHaberesGravados, {
                                align: "right",
                                width: 45,
                            });

                            if(liq.descuentoAporteJubilatorio != null && liq.descuentoAporteJubilatorio != 0){
                                alturaDescuentosCopia = alturaDescuentosCopia + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Aporte Jubilatorio", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.valorAporteJubilatorio + "%", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.descuentoAporteJubilatorio, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.descuentoFRL != null && liq.descuentoFRL != 0){
                                alturaDescuentosCopia = alturaDescuentosCopia + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("FRL", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.valorFRL + "%", {
                                    align: "center",
                                    width: 35,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.descuentoFRL, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.descuentoSeguroPorEnfermedad != null && liq.descuentoSeguroPorEnfermedad != 0){
                                alturaDescuentosCopia = alturaDescuentosCopia + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Seguro por Enfermedad", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.valorSeguroPorEnfermedad + "%", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.descuentoSeguroPorEnfermedad, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.valorAdicionalSNIS != null && liq.valorAdicionalSNIS != 0){
                                alturaDescuentosCopia = alturaDescuentosCopia + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Adicional SNIS", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.valorAdicionalSNIS + "%", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.descuentoSNIS, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.montoAdelantos != null && liq.montoAdelantos != 0){
                                alturaDescuentosCopia = alturaDescuentosCopia + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Adelantos", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.montoAdelantos, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.montoRetenciones != null && liq.montoRetenciones != 0){
                                alturaDescuentosCopia = alturaDescuentosCopia + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Retenciones", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.montoRetenciones, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                        }

                        if(liq.nombre == "Salario Vacacional"){
                            alturaHaberesCopia = alturaHaberesCopia + 12;
                            doc.x = 25;
                            doc.y = alturaHaberesCopia;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text("Salario Vacacional", {
                                align: "left",
                            });
                    
                            doc.x = 160;
                            doc.y = alturaHaberesCopia;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text(liq.diasGozarSV + " x " + liq.montoDiaSV, {
                                align: "center",
                                width: 60,
                            });
                    
                            doc.x = 220;
                            doc.y = alturaHaberesCopia;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text(liq.totalHaberes, {
                                align: "right",
                                width: 45,
                            });
                            
                            if(liq.montoAdelantos != null && liq.montoAdelantos != 0){
                                alturaDescuentosCopia = alturaDescuentosCopia + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Adelantos", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.montoAdelantos, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.montoRetenciones != null && liq.montoRetenciones != 0){
                                alturaDescuentosCopia = alturaDescuentosCopia + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Retenciones", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.montoRetenciones, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                        }

                        if(liq.nombre == "Egreso"){
                            alturaHaberesCopia = alturaHaberesCopia + 12;
                            doc.x = 25;
                            doc.y = alturaHaberesCopia;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text("Licencia no gozada", {
                                align: "left",
                            });
                    
                            doc.x = 160;
                            doc.y = alturaHaberesCopia;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text("", {
                                align: "center",
                                width: 25,
                            });
                    
                            doc.x = 220;
                            doc.y = alturaHaberesCopia;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text(liq.egresoLicenciaNoGozada, {
                                align: "right",
                                width: 45,
                            });
                            
                           
                            alturaHaberesCopia = alturaHaberesCopia + 12;
                            doc.x = 25;
                            doc.y = alturaHaberesCopia;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text("Sal. Vac. por egreso", {
                                align: "left",
                            });
                    
                            doc.x = 160;
                            doc.y = alturaHaberesCopia;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text("", {
                                align: "center",
                                width: 25,
                            });
                    
                            doc.x = 220;
                            doc.y = alturaHaberesCopia;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text(liq.egresoSV, {
                                align: "right",
                                width: 45,
                            });

                            
                            alturaHaberesCopia = alturaHaberesCopia + 12;
                            doc.x = 25;
                            doc.y = alturaHaberesCopia;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text("Aguinaldo", {
                                align: "left",
                            });
                    
                            doc.x = 160;
                            doc.y = alturaHaberesCopia;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text("", {
                                align: "center",
                                width: 25,
                            });
                    
                            doc.x = 220;
                            doc.y = alturaHaberesCopia;
                            doc.fillColor('black')
                            doc.fontSize(9);
                            doc.text(liq.totalHaberesGravados, {
                                align: "right",
                                width: 45,
                            });
                            
                            if(liq.egresoIPD != 0){
                                alturaHaberesCopia = alturaHaberesCopia + 12;
                                doc.x = 25;
                                doc.y = alturaHaberesCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Indemn. por despido", {
                                    align: "left",
                                });
                        
                                doc.x = 160;
                                doc.y = alturaHaberesCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("", {
                                    align: "center",
                                    width: 25,
                                });
                        
                                doc.x = 220;
                                doc.y = alturaHaberesCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.egresoIPD, {
                                    align: "right",
                                    width: 45,
                                });

                                alturaHaberesCopia = alturaHaberesCopia + 12;
                                doc.x = 25;
                                doc.y = alturaHaberesCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Alícuota IPD Aguinaldo", {
                                    align: "left",
                                });
                        
                                doc.x = 160;
                                doc.y = alturaHaberesCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("", {
                                    align: "center",
                                    width: 25,
                                });
                        
                                doc.x = 220;
                                doc.y = alturaHaberesCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.egresoAlicuotaAguinaldo, {
                                    align: "right",
                                    width: 45,
                                });

                                alturaHaberesCopia = alturaHaberesCopia + 12;
                                doc.x = 25;
                                doc.y = alturaHaberesCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Alícuota IPD Licencia ", {
                                    align: "left",
                                });
                        
                                doc.x = 160;
                                doc.y = alturaHaberesCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("", {
                                    align: "center",
                                    width: 25,
                                });
                        
                                doc.x = 220;
                                doc.y = alturaHaberesCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.egresoAlicuotaLicencia, {
                                    align: "right",
                                    width: 45,
                                });

                                alturaHaberesCopia = alturaHaberesCopia + 12;
                                doc.x = 25;
                                doc.y = alturaHaberesCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Alícuoua IPD SV", {
                                    align: "left",
                                });
                        
                                doc.x = 160;
                                doc.y = alturaHaberesCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("", {
                                    align: "center",
                                    width: 25,
                                });
                        
                                doc.x = 220;
                                doc.y = alturaHaberesCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.egresoAlicuotaSV, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.descuentoAporteJubilatorio != null && liq.descuentoAporteJubilatorio != 0){
                                alturaDescuentosCopia = alturaDescuentosCopia + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Aporte Jubilatorio", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.valorAporteJubilatorio + "%", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.descuentoAporteJubilatorio, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.descuentoFRL != null && liq.descuentoFRL != 0){
                                alturaDescuentosCopia = alturaDescuentosCopia + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("FRL", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.valorFRL + "%", {
                                    align: "center",
                                    width: 35,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.descuentoFRL, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.descuentoSeguroPorEnfermedad != null && liq.descuentoSeguroPorEnfermedad != 0){
                                alturaDescuentosCopia = alturaDescuentosCopia + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Seguro por Enfermedad", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.valorSeguroPorEnfermedad + "%", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.descuentoSeguroPorEnfermedad, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.valorAdicionalSNIS != null && liq.valorAdicionalSNIS != 0){
                                alturaDescuentosCopia = alturaDescuentosCopia + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Adicional SNIS", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.valorAdicionalSNIS + "%", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.descuentoSNIS, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.irpf != null){
                                alturaDescuentosCopia = alturaDescuentosCopia + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("IRPF", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.irpf, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.montoAdelantos != null && liq.montoAdelantos != 0){
                                alturaDescuentosCopia = alturaDescuentosCopia + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Adelantos", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.montoAdelantos, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                            
                            if(liq.montoRetenciones != null && liq.montoRetenciones != 0){
                                alturaDescuentosCopia = alturaDescuentosCopia + 12;
                                doc.x = 290;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("Retenciones", {
                                    align: "left",
                                });

                                doc.x = 425;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text("", {
                                    align: "center",
                                    width: 25,
                                });

                                doc.x = 490;
                                doc.y = alturaDescuentosCopia;
                                doc.fillColor('black')
                                doc.fontSize(9);
                                doc.text(liq.montoRetenciones, {
                                    align: "right",
                                    width: 45,
                                });
                            }
                        }

                        doc.x = 25;
                        doc.y = 303 + copia;
                        doc.fillColor('black')
                        doc.fontSize(9);
                        doc.text("Total Gravado: " + liq.totalHaberesGravados, {
                            align: "left",
                        });
                        
                        doc.x = 150;
                        doc.y = 303+ copia;
                        doc.fillColor('black')
                        doc.fontSize(9);
                        doc.text("Total de Haberes: " + liq.totalHaberes, {
                            align: "left",
                        });

                        doc.x = 400;
                        doc.y = 303+ copia;
                        doc.fillColor('black')
                        doc.fontSize(9);
                        doc.text("Total de Descuentos: " + liq.totalDescuentos, {
                            align: "right",
                        });

                        doc.x = 400;
                        doc.y = 340+ copia;
                        doc.font("Helvetica-Bold")
                        doc.fillColor('black')
                        doc.fontSize(11);
                        doc.text("Líquido a Cobrar: " + liq.liquidoCobrar, {
                            align: "right",
                        });

                        doc.x = 490;
                        doc.y = 378+ copia;
                        doc.font("Helvetica")
                        doc.fillColor('black')
                        doc.fontSize(7);
                        doc.text("Firma", {
                            align: "left",
                        });
                    });
                    var fecha = new Date();
                    var horas = fecha.getHours();
                    var minutos = fecha.getMinutes();
                    var segundos = fecha.getSeconds();

                    doc.pipe(fs.createWriteStream("recibos/out-" + horas + "-" + minutos + "-" + segundos + ".pdf"));
                    //var stream = doc.pipe(blobStream());
                    //doc.pipe( fs.createWriteStream(res) )
                    //res.send("out.pdf");
                    doc.end();
                    // stream.on("finish", function(){
                    //     res.send(stream.toBlobURL("application/pdf"));
                    // });
                    //res.download("recibo.pdf");
                }
                else{
                    console.log("Empresa en null");
                }
            }
        }  
    );
    //doc.pipe(fs.createWriteStream('out.pdf'));
    // doc.end();    
};