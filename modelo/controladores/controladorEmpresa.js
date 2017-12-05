var Empresa = require("../clases/empresa");

exports.getEmpresas = function(req, res){
    Empresa.find(
        function(err, empresas){
            if(err){
                res.send(err);
                console.log(err);
            }
            else{
                res.json(empresas);
                console.log(empresas);
            }
        }
    );
};

exports.registrarEmpresa = function (req, res){
    var empresa = new Empresa({
        nombre: req.body.nombre,
        razonSocial: req.body.razonSocial,
        numRut: req.body.numRut,
        numBps: req.body.numBps,
        direccion: req.body.direccion,
        telefono: req.body.telefono,
        tipoContribuyente: req.body.tipoContribuyente,
        tipoAportacion: req.body.tipoAportacion
    });
    empresa.save(function(err){
        if(err){
            if(err.code === 11000){
                res.json({
                    exito: false,
                    mensaje: "Ya existe una empresa con ese nombre o con alguno de los identificadores proporcionados (RUT, BPS, Razón Social, etc)" 
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
                mensaje: "Empresa creada"
            });
        }
    });
};

exports.liquidacionesEmpresa = function (req, res){
    Empresa.findOne({ nombre: req.body.nombre }, function(err, empresa){
        if(err){
            res.send(err);
            console.log(err);
        }
        else{
            res.json(empresa);
            conslole.log(empresa);
        }
    });
};