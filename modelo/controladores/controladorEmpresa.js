var Empresa = require("../clases/empresa");
var TipoAportacionEmpresa = require("../clases/tipoAportacionEmpresa");
var TipoContribuyenteEmpresa = require("../clases/tipoContribuyenteEmpresa");

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

exports.getTiposAportacion = function (req, res){
    TipoAportacionEmpresa.find(
        function(err, tiposDeAportacion){
            if(err){
                res.send(err);
                console.log(err);
            }
            else{
                res.json(tiposDeAportacion);
                console.log(tiposDeAportacion);
            }
        }
    );
};

exports.nuevoTipoAportacion = function (req, res){
    tipoAportacion = new TipoAportacionEmpresa({
        codigo: req.body.codigo,
        titulo: req.body.titulo
    });
    tipoAportacion.save(function(err){
        if(err){
            res.json({
                exito: false,
                mensaje: err
            });
        }
        else{
            res.json({
                exito: true,
                mensaje: "Tipo de Aportación creado"
            });
        }
    });
};

//Crea tipo de contribuyente
exports.nuevoTipoContribuyente = function(req, res){
    console.log(req.params);
    //empieza en ":", se lo quito:
    var ta = req.params.ta.substring(1);
    console.log(req.body);

    var tipoContribuyente = new TipoContribuyenteEmpresa({
        codigoTA: ta,
        codigoTC: req.body.codigoTC,
        tituloTC: req.body.tituloTC
    });
    tipoContribuyente.save(function(err){
        if(err){
            res.json({
                exito: false,
                mensaje: err
            });
        }
        else{
            res.json({
                exito: true,
                mensaje: "Tipo de Contribuyente creado"
            });
        }
    });
        // TipoAportacionEmpresa.findOne({codigo: ta}, function(err, tipoAportacion){
    //     if(err){
    //         res.send(err);
    //         console.log(err);
    //     }
    //     else{
    //         console.log(tipoAportacion);

    //         tipoAportacion.set({
    //             tiposContribuyente : {
    //                 codigoTC : req.body.codigoTC,
    //                 tituloTC : req.body.tituloTC
    //             }
    //         });
    //         tipoAportacion.save(function(err){
    //             if(err){
    //                 res.json({
    //                     exito: false,
    //                     mensaje: err
    //                 });
    //             }
    //             else{
    //                 res.json({
    //                     exito: true,
    //                     mensaje: "Tipo de Contribuyente creado"
    //                 });
    //             }
    //         });

    //         // tipoAportacion.tiposContribuyente.set({
    //         //     codigoTC : req.body.codigoTC,
    //         //     tituloTC : req.body.tituloTC
    //         // });
    //         // tipoAportacion.save(function(err){
    //         //     if(err){
    //         //         res.json({
    //         //             exito: false,
    //         //             mensaje: err
    //         //         });
    //         //     }
    //         //     else{
    //         //         res.json({
    //         //             exito: true,
    //         //             mensaje: "Tipo de Contribuyente creado"
    //         //         });
    //         //     }
    //         // })
    //         // console.log(tipoAportacion);
    //     }
    // });
}

exports.getTiposContribuyentes = function(req, res){
    //var ta = req.params.ta.substring(1);
    TipoContribuyenteEmpresa.find({ codigoTA: req.params.ta },
        function(err, tiposContribuyentes){
            if(err){
                res.send(err);
                console.log(err);
            }
            else{
                res.json(tiposContribuyentes);
                console.log(tiposContribuyentes);
            }
        }
    );
};