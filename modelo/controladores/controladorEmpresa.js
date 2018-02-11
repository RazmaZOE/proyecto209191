var Empresa = require("../clases/empresa");
var TipoAportacionEmpresa = require("../clases/tipoAportacionEmpresa");
var TipoContribuyenteEmpresa = require("../clases/tipoContribuyenteEmpresa");

exports.getEmpresas = function(req, res){
    var query = { perteneceA: req.params.usuario };
    Empresa.find(query,
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
    if(!req.body.subgrupo){
        req.body.subgrupo = 0;
    }
    if(!req.body.grupo){
        req.body.grupo = 0;
    }
    if(!req.body.numBse){
        req.body.numBse = 0;
    }
    if(!req.body.numMtss){
        req.body.numMtss = 0;
    }
    if(!req.body.telefono){
        req.body.telefono = 0;
    }
    var empresa = new Empresa({
        nombre: req.body.nombre,
        razonSocial: req.body.razonSocial,
        numRut: req.body.numRut,
        numBps: req.body.numBps,
        numBse: req.body.numBse,
        numMtss: req.body.numMtss,
        grupo: req.body.grupo,
        subgrupo: req.body.subgrupo,
        direccion: req.body.direccion,
        telefono: req.body.telefono,
        tipoContribuyente: req.body.tipoContribuyente,
        tipoAportacion: req.body.tipoAportacion,
        perteneceA: req.body.usuario
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

exports.buscarEmpresa = function (req, res){
    console.log("id de la empresa a buscar: " + req.params.id)
    var query = { _id: req.params.id };
    Empresa.findOne(query, 
        function(err, empresa){
            if(err){
                res.send(err);
                console.log(err);
            }
            else{
                res.json(empresa);
                console.log(empresa);
            }
    });
};

exports.editarEmpresa = function (req, res){
    if(!req.body.subgrupo){
        req.body.subgrupo = 0;
    }
    if(!req.body.grupo){
        req.body.grupo = 0;
    }
    if(!req.body.numBse){
        req.body.numBse = 0;
    }
    if(!req.body.numMtss){
        req.body.numMtss = 0;
    }
    if(!req.body.telefono){
        req.body.telefono = 0;
    }
    var query = { _id: req.body._id };
    Empresa.findOneAndUpdate(query, {
        razonSocial: req.body.razonSocial,
        numRut: req.body.numRut,
        numBps: req.body.numBps,
        numBse: req.body.numBse,
        numMtss: req.body.numMtss,
        grupo: req.body.grupo,
        subgrupo: req.body.subgrupo,
        direccion: req.body.direccion,
        telefono: req.body.telefono,
        tipoContribuyente: req.body.tipoContribuyente,
        tipoAportacion: req.body.tipoAportacion
    },  function(err, empresa){
            if(err){
                res.json({
                    exito: false,
                    mensaje: err
                });
            }
            else{
                res.json({
                    exito: true,
                    mensaje: "Empresa editada"
                });
            }
        }
    );
};

exports.liquidacionesEmpresa = function (req, res){
    Empresa.findOne({ nombre: req.body.nombre }, function(err, empresa){
        if(err){
            res.send(err);
            console.log(err);
        }
        else{
            res.json(empresa);
            console.log(empresa);
        }
    });
};

exports.getTiposAportacion = function (req, res){
    console.log("vino a getTipoAportacion");
    TipoAportacionEmpresa.find(
        function(err, tiposDeAportacion){
            if(err){
                res.send(err);
                console.log("Error: " + err);
            }
            else{
                console.log("Tipos Aportacion: " + tiposDeAportacion);
                res.json(tiposDeAportacion);
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