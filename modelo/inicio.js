var Usuario = require("./clases/usuario");
var Empresa = require("./clases/empresa");
var controladorUsuario = require("./controladores/controladorUsuario");
var controladorEmpresa = require("./controladores/controladorEmpresa");
var controladorLiquidacion = require("./controladores/controladorLiquidacion");
var controladorEmpleado = require("./controladores/controladorEmpleado");

module.exports = function(app) {
    app.post("/registro", controladorUsuario.registrarUsuario);
    app.post("/login", controladorUsuario.login);

    app.get("/empresas/:usuario", controladorEmpresa.getEmpresas);
    app.post("/empresas/nueva", controladorEmpresa.registrarEmpresa);
    app.get("/empresas/buscar/:id", controladorEmpresa.buscarEmpresa);
    app.put("/empresas/editar/", controladorEmpresa.editarEmpresa);
    app.post("/empresas/liquidaciones", controladorEmpresa.liquidacionesEmpresa); //ver para qué es esto
    app.get("/empresas/tipoAportacion", controladorEmpresa.getTiposAportacion);
    app.post("/empresas/tipoAportacion/nuevo", controladorEmpresa.nuevoTipoAportacion);
    app.post("/empresas/tipoAportacion/tipoContribuyente/:ta", controladorEmpresa.nuevoTipoContribuyente);
    app.get("/empresas/tipoAportacion/tipoContribuyente/:ta", controladorEmpresa.getTiposContribuyentes);
    
    app.get("/empleados/:id", controladorEmpleado.getEmpleados);
    app.get("/empleados/buscar/:ci", controladorEmpleado.getEmpleadoPorCI)
    app.post("/empleados/nuevo", controladorEmpleado.nuevoEmpleado);
    app.put("/empleados/editar/:id", controladorEmpleado.editarEmpleado);
    app.get("/empleados/diasLicencia/:empleadoFechaIngreso/:fechaLiquidacionMes/:fechaLiquidacionAnio", controladorEmpleado.diasLicencia);
    app.post("/empleados/darDeBaja", controladorEmpleado.darDeBaja);

    app.get("/liquidaciones/:empresa", controladorLiquidacion.getLiquidaciones); //ver
    //app.get("/liquidaciones/tiposHaberes", controladorLiquidacion.getTiposHaberes);
    app.post("/liquidaciones/calcularMontoJornales", controladorLiquidacion.calcularMontoJornales);
    app.post("/liquidaciones/calcularFaltas", controladorLiquidacion.calcularFaltas);
    app.post("/liquidaciones/calcularHorasExtra", controladorLiquidacion.calcularHorasExtra);
    app.post("/liquidaciones/calcularDescansoTrabajado", controladorLiquidacion.calcularDescansoTrabajado);
    app.post("/liquidaciones/calcularFeriadoTrabajado", controladorLiquidacion.calcularFeriadoTrabajado);
    app.post("/liquidaciones/calcularSalarioVacacional", controladorLiquidacion.calcularSalarioVacacional);
    app.post("/liquidaciones/calcularIrpf", controladorLiquidacion.calcularIrpf);
    app.post("/liquidaciones/calcularEgreso", controladorLiquidacion.calcularEgreso);
    app.post("/liquidaciones/guardarNueva", controladorLiquidacion.guardarNueva);
    app.post("/liquidaciones/editarLiquidacion", controladorLiquidacion.editarLiquidacion);
    app.get("/liquidaciones/buscar/:empresa/:nombre/:mes/:anio/:empleadoId", controladorLiquidacion.buscarLiquidacion);
    app.get("/liquidaciones/calcularDiasGozadosSV/:empresa/:empleadoId/:mes/:anio", controladorLiquidacion.calcularDiasGozados);
    app.get("/liquidaciones/calcularAguinaldo/:empresa/:nombre/:mes/:anio/:empleadoId", controladorLiquidacion.calcularAguinaldo);
    app.post("/liquidaciones/imprimir", controladorLiquidacion.imprimirRecibos);

    app.get("*", function (req, res){
        res.sendFile("login.html", { root: "./vistas/"});
    });
};