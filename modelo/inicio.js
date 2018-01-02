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
    app.post("/empresas/liquidaciones", controladorEmpresa.liquidacionesEmpresa);
    
    app.get("/empleados/:id", controladorEmpleado.getEmpleados);
    app.post("/empleados/nuevo", controladorEmpleado.nuevoEmpleado);

    app.get("/liquidaciones", controladorLiquidacion.getLiquidaciones);

    app.get("*", function (req, res){
        res.sendFile("login.html", { root: "./vistas/"});
    });
};