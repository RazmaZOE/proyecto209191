var Usuario = require("./clases/usuario");
var Empresa = require("./clases/empresa");
var controladorUsuario = require("./controladores/controladorUsuario");
var controladorEmpresa = require("./controladores/controladorEmpresa");
var controladorLiquidacion = require("./controladores/controladorLiquidacion");
var controladorEmpleado = require("./controladores/controladorEmpleado");

module.exports = function(app) {
    app.post("/registro", controladorUsuario.registrarUsuario);
    app.post("/login", controladorUsuario.login);

    app.get("/empresas", controladorEmpresa.getEmpresas);
    app.post("/empresas/nueva", controladorEmpresa.registrarEmpresa);
    app.post("/empresas/liquidaciones", controladorEmpresa.liquidacionesEmpresa); //ver para qué es esto
    app.get("/empresas/tipoAportacion", controladorEmpresa.getTiposAportacion);
    app.post("/empresas/tipoAportacion/nuevo", controladorEmpresa.nuevoTipoAportacion);
    app.post("/empresas/tipoAportacion/tipoContribuyente/:ta", controladorEmpresa.nuevoTipoContribuyente);
    app.get("/empresas/tipoAportacion/tipoContribuyente/:ta", controladorEmpresa.getTiposContribuyentes);
    
    app.get("/empleados/:id", controladorEmpleado.getEmpleados);
    app.post("/empleados/nuevo", controladorEmpleado.nuevoEmpleado);

    app.get("/liquidaciones", controladorLiquidacion.getLiquidaciones); //ver

    app.get("*", function (req, res){
        res.sendFile("login.html", { root: "./vistas/"});
    });
};