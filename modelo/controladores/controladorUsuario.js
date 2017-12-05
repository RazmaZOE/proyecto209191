var Usuario = require("../clases/usuario");

exports.registrarUsuario = function (req, res){
    var user = new Usuario({
        nombre: req.body.nombreUsuario.toLowerCase(),
        password: req.body.password,
        rol: "admin" 
    });
    user.save(function(err){
        if(err){
            res.json({
                exito: false,
                mensaje: err
            });
        }
        else{
            res.json({
                exito: true,
                mensaje: "Usuario registrado"
            });
        }
    });
};

exports.login = function(req, res){
    if(!req.body.nombreUsuario){
        res.json({
            exito: false,
            mensaje: "No se introdujo el nombre de usuario"
        });
    }
    else{
        if(!req.body.password){
            res.json({
                exito: false,
                mensaje: "No se introdujo la contraseña"
            });
        }
        else{
            Usuario.findOne({
                nombre: req.body.nombreUsuario.toLowerCase()
            }, function(err, user){
                if(err){
                    res.json({
                        exito: false,
                        mensaje: err
                    });
                }
                else{
                    if(!user){
                        res.json({
                            exito: false,
                            mensaje: "Usuario no encontrado"
                        });
                    }
                    else{
                        var passwordOk = user.verifyPasswordSync(req.body.password);
                        console.log("var passwordOk: " + passwordOk);
                        if(!passwordOk){
                            res.json({
                                exito: false,
                                mensaje: "Contraseña incorrecta"
                            });
                        }
                        else{
                            res.json({
                                exito: true,
                                mensaje: "Login correcto",
                                usuario: { nombre: user.nombre }
                            });
                        }
                    }
                }
            });
        }
    }
}