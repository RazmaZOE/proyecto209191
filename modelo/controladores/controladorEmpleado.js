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

exports.nuevoEmpleado = function(req, res){
    var empleado = new Empleado({
        nombres: req.body.nombres,
        apellidos: req.body.apellidos,
        ci: req.body.ci,
        fechaNacimiento: req.body.fechaNacimiento,
        fechaIngreso: req.body.fechaIngreso,
        seguroSalud: req.body.seguroSalud,
        banco: req.body.banco,
        numSucursalBanco: req.body.numSucursalBanco,
        numCuentaBanco: req.body.numCuentaBanco,
        empresa: req.body.empresa
    });
    empleado.save(function(err){
        if(err){
            res.json({
                exito: false,
                mensaje: err
            });
        }
        else{
            res.json({
                exito: true,
                mensaje: "Empleado creado"
            });
        }
    });
};