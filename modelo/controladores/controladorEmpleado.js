var Empleado = require("../clases/empleado");

exports.getEmpleados = function(req, res){
    console.log(req.params.id);
    Empleado.find({empresa: req.params.id},
        function(err, empleados){
            if(err){
                res.send(err);
                console.log(err);
            }
            else{
                res.json(empleados);
            }
        }
    );
};

exports.getEmpleadoPorCI = function(req, res){
    Empleado.findOne({ci: req.params.ci},
        function(err, empleado){
            if(err){
                res.send(err);
                console.log(err);
            }
            else{
                res.json(empleado);
            }
        }
    );
};

exports.nuevoEmpleado = function(req, res){
    var empleado = new Empleado({
        nombres: req.body.nombres,
        apellidos: req.body.apellidos,
        ci: req.body.ci,
        fechaNacimiento: req.body.fechaNacimiento,
        fechaIngreso: req.body.fechaIngreso,
        fechaEgreso: null,
        seguroSalud: req.body.seguroSalud,
        horario : req.body.horario,
        horasPorDia : req.body.horasPorDia,
        cargo: req.body.cargo,
        banco: req.body.banco,
        numSucursalBanco: req.body.numSucursalBanco,
        numCuentaBanco: req.body.numCuentaBanco,
        esJornalero: req.body.esJornalero,
        sueldo: req.body.sueldo,
        empresa: req.body.empresa,
        hijosMenores: req.body.hijosMenores
    });
    empleado.save(function(err){
        if(err){
            if(err.code === 11000){
                res.json({
                    exito: false,
                    mensaje: "Ya existe una empleado con esa cédula" 
                });
            }
            else{
                res.json({
                    exito: false,
                    mensaje: err
                });
            }
        }
        else{
            res.json({
                exito: true,
                mensaje: "Empleado creado"
            });
        }
    });
};

exports.editarEmpleado = function(req, res){
    var query = { _id: req.params.id };
    Empleado.findOneAndUpdate(query, {
        nombres: req.body.nombres,
        apellidos: req.body.apellidos,
        ci: req.body.ci,
        fechaNacimiento: req.body.fechaNacimiento,
        fechaIngreso: req.body.fechaIngreso,
        seguroSalud: req.body.seguroSalud,
        horario : req.body.horario,
        horasPorDia : req.body.horasPorDia,
        cargo: req.body.cargo,
        banco: req.body.banco,
        numSucursalBanco: req.body.numSucursalBanco,
        numCuentaBanco: req.body.numCuentaBanco,
        esJornalero: req.body.esJornalero,
        sueldo: req.body.sueldo,
        empresa: req.body.empresa,
        hijosMenores: req.body.hijosMenores
    }, function(err, empleado){
        if(err){
            res.json({
                exito: false,
                mensaje: err
            });
        }
        else{
            res.json({
                exito: true,
                mensaje: "Empleado editado"
            });
        }
    });
};

exports.diasLicencia = function(req, res){
    console.log("Días de licencia body: " + req.params.empleadoFechaIngreso);
    var diasLicencia = 0;
    var dateLiquidacion = new Date(req.params.fechaLiquidacionAnio, req.params.fechaLiquidacionMes -1);
    var anioLicencia = dateLiquidacion.getFullYear();
    var ultDiaAnioPasado = new Date(anioLicencia, 00, 01); //Toma la hora 0:00 del día => 01ene-00:00 = 31dic24:00
    var fechaIngreso = new Date(req.params.empleadoFechaIngreso);
    //var aniosTrabajados = (ultDiaAnioPasado - fechaIngreso) / (1000*60*60*24*365); // milisegundos -> segundos -> minutos -> horas -> días -> años 
    var aniosTrabajados = ultDiaAnioPasado.getFullYear() - 1 - fechaIngreso.getFullYear();
    if(aniosTrabajados < 1){
        diasLicencia = (ultDiaAnioPasado - fechaIngreso) / (1000*60*60*24); //dias
        diasLicencia = Math.round(diasLicencia * 20 /365);
        if(diasLicencia < 0){
            diasLicencia = 0;
        }
    }
    if (aniosTrabajados >= 1 && aniosTrabajados < 5 ){
        diasLicencia = 20;
    }
    if(aniosTrabajados >= 5){
        diasLicencia = 20 + parseInt(aniosTrabajados/4);
    }
    console.log(diasLicencia);
    res.send(diasLicencia.toString());
};

exports.darDeBaja = function(req, res){
    var query = {_id: req.body._id};
    Empleado.findOneAndUpdate(query, {
        fechaEgreso: new Date(req.body.fechaEgreso)
    }, function(err, empleado){
        if(err){
            res.json({
                exito: false,
                mensaje: err
            });
        }
        else{
            res.json({
                exito: true,
                mensaje: "Empleado dado de baja"
            });
        }
    });
}