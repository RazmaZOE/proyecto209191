var Liquidacion = require("../clases/liquidacion");
var Empleado = require("../clases/empleado");

exports.getLiquidaciones = function(req, res){
    Liquidacion.find({empresa: req.body.empresa},
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