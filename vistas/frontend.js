var appLogin = angular.module("appLogin", []);

appLogin.controller("controladorLogin", function($scope, $http){
    localStorage.clear();
    $scope.mensaje = "";

    $scope.login = function (){
        $http.post("/login", $scope.loginUsuario).then(respuestaOk, respuestaError);

        function respuestaOk(respuesta){
            $scope.mensaje = respuesta.data.mensaje;
            console.log(respuesta.data);
            if(respuesta.data.exito){
                localStorage.setItem("usuario", respuesta.data.usuario.nombre);
                localStorage.setItem("estaLogeado", true);
                window.location.replace("spa.html");
            }
        }
        function respuestaError(respuesta){
            console.log("Error: " + respuesta.data);
        }
    }

    $scope.registro = function(){
        $http.post("/registro", $scope.registroUsuario).then(respuestaOk, respuestaError);

        function respuestaOk(respuesta){
            $scope.mensaje = respuesta.data.mensaje;
            if(respuesta.data.exito){
                window.location.replace("login.html");
            }
        }
        function respuestaError(respuesta){
            console.log("Error: " + respuesta.data);
        }
    }
});

var appEmpresa = angular.module("appEmpresa", ["ngRoute"]);

appEmpresa.constant("baseUrl", "http://localhost:3000/");

appEmpresa.config(function($routeProvider, $locationProvider){
    $routeProvider
    .when("/cerrarSesion", {
        templateUrl : "cerrarSesion.html",
        controller : "controladorLogin"
    })
    .when("/empresas", {
        templateUrl : "empresas.html",
        controller : "controladorEmpresas"
    })
    .when("/empresaNueva", {
        templateUrl : "empresaNueva.html",
        controller : "controladorEmpresaNueva"
    })
    .when("/empresaEditar", {
        templateUrl : "empresaEditar.html",
        controller : "controladorEmpresaEditar"
    })
    .when("/liquidaciones", {
        templateUrl : "liquidaciones.html",
        controller : "controladorEmpresaLiquidaciones"
    })
    .when("/liquidacionNueva", {
        templateUrl : "liquidacionNueva.html",
        controller : "controladorEmpresaLiquidacionNueva"
    })
    .when("/empleados", {
        templateUrl : "empleados.html",
        controller : "controladorEmpresaEmpleados"
    })
    .when("/empleadoNuevo", {
        templateUrl : "empleadoNuevo.html",
        controller : "controladorEmpleadoNuevo"
    })
    .when("/empleadoEditar", {
        templateUrl : "empleadoEditar.html",
        controller : "controladorEmpleadoEditar"
    })
    .when("/tipoAportacionNuevo", {
        templateUrl : "tipoAportacionNuevo.html",
        controller : "controladorEmpresas"
    })
    .when("/tipoContribuyenteNuevo/:ta", {
        templateUrl : "tipoContribuyenteNuevo.html",
        controller : "controladorEmpresas"
    })
    .otherwise({
        templateUrl : "empresas.html",
        controller : "controladorEmpresas"
    });
    $locationProvider.html5Mode(true);
});

appEmpresa.controller("controladorLogin", function($scope, $http){
    window.location.replace("login.html");
});

appEmpresa.controller("controladorEmpresas", function($scope, $http, $location, $routeParams){
    if(!localStorage.estaLogeado){
        window.location.replace("login.html");
    }
    else{
        localStorage.removeItem("empresaSeleccionada");
        $scope.empresas = {};
        
        $http.get("/empresas/" + localStorage.usuario).then(respuestaOk, respuestaError);
    
        function respuestaOk(respuesta){
            $scope.empresas = respuesta.data;
        }
        function respuestaError(respuesta){
            console.log("Error: " + respuesta.data);
        }

        $scope.liquidacionesEmpresa = function(empresa){
            $http.get("/liquidaciones", empresa).then(respuestaOk, respuestaError);

            function respuestaOk(respuesta){
                localStorage.setItem("empresaSeleccionada", empresa.nombre);
                //window.location.replace("liquidaciones.html");
                $location.path("/liquidaciones");
            }
            function respuestaError(respuesta){
                console.log("Error: " + respuesta.data);
            }
        }

        $scope.empresaEditar = function(empresa){
            localStorage.setItem("empresaId", empresa._id);
            console.log(localStorage.empresaId);
            $location.path("/empresaEditar");
        }

        $scope.crearTipoAportacion = function(){
            $http.post("/empresas/tipoAportacion/nuevo", $scope.tipoAportacionNuevo).then(respuestaOk, respuestaError);

            function respuestaOk(respuesta){
                $scope.mensaje = respuesta.data.mensaje;
                if(respuesta.data.exito){
                    $location.path("empresaNueva");
                }
                else{
                    $scope.mensaje = respuesta.data.mensaje;
                }
            }
            function respuestaError(respuesta){
                console.log("Error: " + respuesta.data);
            }
        }

        $scope.crearTipoContribuyente = function(){
            //Ver cómo pasar el tipo de aportación
            var codTipoCont = $routeParams.ta;
            console.log(codTipoCont);
            console.log($scope.tipoContribuyenteNuevo);
            $http.post("/empresas/tipoAportacion/tipoContribuyente/" + codTipoCont, $scope.tipoContribuyenteNuevo).then(respuestaOk, respuestaError);

            function respuestaOk(respuesta){
                $scope.mensaje = respuesta.data.mensaje;
                if(respuesta.data.exito){
                    // Tengo que dar el alta del tipo de contribuyente
                    $location.path("empresaNueva");
                }
                else{
                    $scope.mensaje = respuesta.data.mensaje;
                }
            }
            function respuestaError(respuesta){
                console.log("Error: " + respuesta.data);
            }
        }
    }
});

appEmpresa.controller("controladorEmpresaNueva", function($scope, $http, $location, $route){
    if(!localStorage.estaLogeado){
        window.location.replace("login.html");
    }
    else{
        $scope.mensaje = "";
        $scope.tApors = {};
        $scope.tConts = {};
        $scope.tApors = cargarTiposAportacion();
        // console.log("antes del get TipoAportacion");
        // $http.get("/empresas/tipoAportacion").then(respuestaOk, respuestaError);

        // function respuestaOk(respuesta){
        //     $scope.tApors = respuesta.data;
        //     console.log($scope.tApors);
        //     console.log(Object.keys(respuesta));
        //     console.log("Largo: " +  Object.keys($scope.tApors).length);
        // }
        // function respuestaError(respuesta){
        //     console.log("Error: " + respuesta.data);
        // }

        $scope.crearEmpresa = function(){
            $scope.empresaNueva.usuario = localStorage.usuario;
            $http.post("/empresas/nueva", $scope.empresaNueva).then(respuestaOk, respuestaError);
            
            function respuestaOk(respuesta){
                $scope.mensaje = respuesta.data.mensaje;
                if(respuesta.data.exito){
                    //window.location.replace("empresas.html");
                    $location.path("/empresas");
                }
                else{
                    $scope.mensaje = respuesta.data.mensaje;
                }
            }
            function respuestaError(respuesta){
                console.log("Error: " + respuesta.data);
            }
        }

        $scope.cargarTiposContribuyentes = function(){
            console.log("$scope.empresaNueva.tipoAportacion: " +   $scope.empresaNueva.tipoAportacion);
            $scope.tApors.forEach(function(tipoAportacion){
                console.log("$scope.tApors: " + tipoAportacion);
                if(tipoAportacion.codigo == $scope.empresaNueva.tipoAportacion){
                    console.log("entró");
                    $scope.tConts = tipoAportacion.tiposContribuyente;
                }
            });
            
            // console.log($scope.empresaNueva.tipoAportacion);
            // $http.get("/empresas/tipoAportacion/tipoContribuyente/" + $scope.empresaNueva.tipoAportacion).then(respuestaOk, respuestaError);
            // console.log("ENTRÓ")

            // function respuestaOk(respuesta){
            //     $scope.tConts = respuesta.data;
            //     console.log($scope.tConts);
            // }
            // function respuestaError(respuesta){
            //     console.log("Error: " + respuesta.data);
            // }
        }

        function cargarTiposAportacion(){
            var tiposAportacion = [
                {
                    "codigo": "01",
                    "titulo": "Industria y Comercio",
                    "tiposContribuyente": [
                        {
                            "codigoTC": "01",
                            "tituloTC": "Propietario individual o Empresa Unipersonal"
                        },
                        {
                            "codigoTC": "02",
                            "tituloTC": "Sociedad de Responsabilidad Limitada"
                        },
                        {
                            "codigoTC": "03",
                            "tituloTC": "Sociedad Anónima"
                        },
                        {
                            "codigoTC": "04",
                            "tituloTC": "Sociedad de Hecho"
                        },
                        {
                            "codigoTC": "05",
                            "tituloTC": "Sociedad Colectiva"
                        },
                        {
                            "codigoTC": "26",
                            "tituloTC": "Unipersonal con hasta 5 dependientes con cobertura médica"
                        },
                        {
                            "codigoTC": "28",
                            "tituloTC": "Unipersonal con un dependiente e integrante con actividad de una sociedad comercial"
                        },
                        {
                            "codigoTC": "29",
                            "tituloTC": "Unipersonal con un dependiente e integrante sin de una sociedad comercial"
                        },
                        {
                            "codigoTC": "31",
                            "tituloTC": "Unipersonal con hasta 5 dependientes sin cobertura médica"
                        }, 
                    ]
                },
                {
                    "codigo": "02",
                    "titulo": "Civil",
                    "tiposContribuyente": [
                        {
                            "codigoTC": "61",
                            "tituloTC": "Org. Público con tasa aporte pat. jub. 7.5%"
                        },
                        {
                            "codigoTC": "62",
                            "tituloTC": "Org. Público con tasa aporte pat. jub. 19.5%"
                        },
                    ]
                },
                {
                    "codigo": "03",
                    "titulo": "Rural",
                    "tiposContribuyente": [
                        {
                            "codigoTC": "01",
                            "tituloTC": "Empresa Rural"
                        },
                        {
                            "codigoTC": "02",
                            "tituloTC": "Empresa Contratista Rural"
                        },
                    ]
                },
                {
                    "codigo": "04",
                    "titulo": "Construcción",
                    "tiposContribuyente": [
                        {
                            "codigoTC": "01",
                            "tituloTC": "Administración total (titular)"
                        },
                        {
                            "codigoTC": "10",
                            "tituloTC": "Regularización por Administración (titular)"
                        },
                    ]
                },
                {
                    "codigo": "05",
                    "titulo": "Notarial",
                    "tiposContribuyente": [
                        {
                            "codigoTC": "78",
                            "tituloTC": "Instituto Prev. Social/Aseguradora - Pasivos"
                        },
                        {
                            "codigoTC": "79",
                            "tituloTC": "Organismo o Empresa que tributa aportes solo al SNIS"
                        },
                    ]
                },
                {
                    "codigo": "06",
                    "titulo": "Bancaria",
                    "tiposContribuyente": [
                        {
                            "codigoTC": "78",
                            "tituloTC": "Instituto Prev. Social/Aseguradora - Pasivos"
                        },
                        {
                            "codigoTC": "79",
                            "tituloTC": "Organismo o Empresa que tributa aportes solo al SNIS"
                        },
                    ]
                },
                {
                    "codigo": "11",
                    "titulo": "Titulares Servicios Personales no Profesionales y Profesionales",
                    "tiposContribuyente": [
                        {
                            "codigoTC": "78",
                            "tituloTC": "Instituto Prev. Social/Aseguradora - Pasivos"
                        },
                        {
                            "codigoTC": "79",
                            "tituloTC": "Organismo o Empresa que tributa aportes solo al SNIS"
                        },
                    ]
                },
            ];
            return tiposAportacion;
        }
    }
});

appEmpresa.controller("controladorEmpresaEditar", function($scope, $http, $location, $route){
    if(!localStorage.estaLogeado){
        window.location.replace("login.html");
    }
    else{
        $scope.mensaje = "";
        $scope.tApors = {};
        $scope.tConts = {};
        $scope.tApors = cargarTiposAportacion();

        function cargarTiposAportacion(){
            var tiposAportacion = [
                {
                    "codigo": "01",
                    "titulo": "Industria y Comercio",
                    "tiposContribuyente": [
                        {
                            "codigoTC": "01",
                            "tituloTC": "Propietario individual o Empresa Unipersonal"
                        },
                        {
                            "codigoTC": "02",
                            "tituloTC": "Sociedad de Responsabilidad Limitada"
                        },
                        {
                            "codigoTC": "03",
                            "tituloTC": "Sociedad Anónima"
                        },
                        {
                            "codigoTC": "04",
                            "tituloTC": "Sociedad de Hecho"
                        },
                        {
                            "codigoTC": "05",
                            "tituloTC": "Sociedad Colectiva"
                        },
                        {
                            "codigoTC": "26",
                            "tituloTC": "Unipersonal con hasta 5 dependientes con cobertura médica"
                        },
                        {
                            "codigoTC": "28",
                            "tituloTC": "Unipersonal con un dependiente e integrante con actividad de una sociedad comercial"
                        },
                        {
                            "codigoTC": "29",
                            "tituloTC": "Unipersonal con un dependiente e integrante sin de una sociedad comercial"
                        },
                        {
                            "codigoTC": "31",
                            "tituloTC": "Unipersonal con hasta 5 dependientes sin cobertura médica"
                        }, 
                    ]
                },
                {
                    "codigo": "02",
                    "titulo": "Civil",
                    "tiposContribuyente": [
                        {
                            "codigoTC": "61",
                            "tituloTC": "Org. Público con tasa aporte pat. jub. 7.5%"
                        },
                        {
                            "codigoTC": "62",
                            "tituloTC": "Org. Público con tasa aporte pat. jub. 19.5%"
                        },
                    ]
                },
                {
                    "codigo": "03",
                    "titulo": "Rural",
                    "tiposContribuyente": [
                        {
                            "codigoTC": "01",
                            "tituloTC": "Empresa Rural"
                        },
                        {
                            "codigoTC": "02",
                            "tituloTC": "Empresa Contratista Rural"
                        },
                    ]
                },
                {
                    "codigo": "04",
                    "titulo": "Construcción",
                    "tiposContribuyente": [
                        {
                            "codigoTC": "01",
                            "tituloTC": "Administración total (titular)"
                        },
                        {
                            "codigoTC": "10",
                            "tituloTC": "Regularización por Administración (titular)"
                        },
                    ]
                },
                {
                    "codigo": "05",
                    "titulo": "Notarial",
                    "tiposContribuyente": [
                        {
                            "codigoTC": "78",
                            "tituloTC": "Instituto Prev. Social/Aseguradora - Pasivos"
                        },
                        {
                            "codigoTC": "79",
                            "tituloTC": "Organismo o Empresa que tributa aportes solo al SNIS"
                        },
                    ]
                },
                {
                    "codigo": "06",
                    "titulo": "Bancaria",
                    "tiposContribuyente": [
                        {
                            "codigoTC": "78",
                            "tituloTC": "Instituto Prev. Social/Aseguradora - Pasivos"
                        },
                        {
                            "codigoTC": "79",
                            "tituloTC": "Organismo o Empresa que tributa aportes solo al SNIS"
                        },
                    ]
                },
                {
                    "codigo": "11",
                    "titulo": "Titulares Servicios Personales no Profesionales y Profesionales",
                    "tiposContribuyente": [
                        {
                            "codigoTC": "78",
                            "tituloTC": "Instituto Prev. Social/Aseguradora - Pasivos"
                        },
                        {
                            "codigoTC": "79",
                            "tituloTC": "Organismo o Empresa que tributa aportes solo al SNIS"
                        },
                    ]
                },
            ];
            return tiposAportacion;
        }

        $http.get("/empresas/buscar/" + localStorage.empresaId).then(respuestaOk, respuestaError);

        function respuestaOk(respuesta){
            $scope.empresaEditar = respuesta.data;
            console.log($scope.empresaEditar.tipoAportacion);
            $scope.tApors.forEach(function(tipoAportacion){
                if(tipoAportacion.codigo == respuesta.data.tipoAportacion){
                    $scope.tConts = tipoAportacion.tiposContribuyente;
                    if(tipoAportacion.tiposContribuyente.codigoTC == respuesta.data.tipoContribuyente){
                        $scope.empresaEditar.tipoContribuyente = tipoAportacion.tiposContribuyente.codigoTC;
                        console.log($scope.empresaEditar.tipoContribuyente);
                    } 
                }
            });
            localStorage.removeItem("empresaId");
        }
        function respuestaError(respuesta){
            console.log("Error: " + respuesta.data);
        }

        $scope.cargarTiposContribuyentes = function(){
            console.log("$scope.empresaNueva.tipoAportacion: " + $scope.empresaEditar.tipoAportacion);
            $scope.tApors.forEach(function(tipoAportacion){
                console.log("$scope.tApors: " + tipoAportacion);
                if(tipoAportacion.codigo == $scope.empresaEditar.tipoAportacion){
                    console.log("entró");
                    $scope.tConts = tipoAportacion.tiposContribuyente;
                }
            });
        }

        $scope.editarEmpresa = function(){
            $http.put("/empresas/editar", $scope.empresaEditar).then(respuestaOk, respuestaError);

            function respuestaOk(respuesta){
                $scope.mensaje = respuesta.data.mensaje;
                if(respuesta.data.exito){
                    $location.path("/empresas");
                }
                else{
                    $scope.mensaje = respuesta.data.mensaje;
                }
            }
            function respuestaError(respuesta){
                console.log("Error: " + respuesta.data);
            }
        }
    }
});


appEmpresa.controller("controladorEmpresaLiquidaciones", function($scope, $http, $location){
    $scope.empresa = "";
    if(!localStorage.estaLogeado){
        window.location.replace("login.html");
    }
    else{
        $scope.empresa = localStorage.empresaSeleccionada;
        $http.get("/liquidaciones/" + $scope.empresa).then(respuestaOk, respuestaError);

        function respuestaOk(respuesta){
            $scope.liquidaciones = respuesta.data;
        }
        function respuestaError(respuesta){
            console.log("Error: " + respuesta.data);
        }
    }
});

appEmpresa.controller("controladorEmpresaLiquidacionNueva", function($scope, $http, $location){
    $scope.empresa = "";
    $scope.empleadoSeleccionado = {};
    $scope.selected = false;
    $scope.tieneAdicionalSNIS = false;
    $scope.valorAdicionalSNIS = 0;
    $scope.empleadoSeleccionado.haberes = 0;
    //$scope.clics = [];
    if(!localStorage.estaLogeado){
        window.location.replace("login.html");
    }
    else{
        $scope.empresa = localStorage.empresaSeleccionada;
        var fecha = new Date();
        $scope.mes = fecha.getMonth()+1;
        $scope.anio = fecha.getFullYear();
        $scope.nombre = "Sueldo";
        $scope.esSueldo = true;
        $scope.esAguinaldo = false;
        $scope.esSalarioVacacional = false;

        $http.get("/empleados/" + $scope.empresa).then(respuestaOk, respuestaError);

        function respuestaOk(respuesta){
            $scope.empleados = respuesta.data;
        }
        function respuestaError(respuesta){
            console.log("Error: " + respuesta.data);
        }

        $scope.setNombre = function(){
            if($scope.nombre == "Sueldo"){
                $scope.esSueldo = true;
                $scope.esAguinaldo = false;
                $scope.esSalarioVacacional = false;
                $scope.esEgreso = false;
            }
            if($scope.nombre == "Aguinaldo"){
                $scope.esSueldo = false;
                $scope.esAguinaldo = true;
                $scope.esSalarioVacacional = false;
                $scope.esEgreso = false;
            }
            if($scope.nombre == "Salario Vacacional"){
                $scope.esSueldo = false;
                $scope.esAguinaldo = false;
                $scope.esSalarioVacacional = true;
                $scope.esEgreso = false;
            }
            if($scope.nombre == "Egreso"){
                $scope.esSueldo = false;
                $scope.esAguinaldo = false;
                $scope.esSalarioVacacional = false;
                $scope.esEgreso = true;
            }
            if($scope.selected){
                buscarLiquidacion();
            }
        }

        $scope.selectEmpleado = function(empleado){
            $scope.valorAporteJubilatorio = 15;
            $scope.valorFRL = 0.125;
            $scope.valorSeguroPorEnfermedad = 3;
            
            $scope.tieneAdicionalSNIS = false;
            $scope.valorAdicionalSNIS = 0;
            $scope.empleadoSeleccionado = empleado;
            $scope.selected = true;
            //$scope.sueldo = empleado.sueldo;
            $scope.liquidacion = {};
            $scope.liquidacion.sueldo = empleado.sueldo;
            $scope.liquidacion.esJornalero = $scope.empleadoSeleccionado.esJornalero;
            $scope.liquidacion.faltas = "";
            $scope.liquidacion.horasExtra ="";
            $scope.mensaje = "";
            $scope.fechaLiquidacion = "";
            $scope.sv = {};
            $scope.egreso = {};
            
            $scope.empleadoSeleccionado.haberes = empleado.sueldo;
            if(empleado.seguroSalud == 1){
                $scope.tieneAdicionalSNIS = true;
                $scope.valorAdicionalSNIS = 3;
            }
            if(empleado.seguroSalud == 15){
                $scope.tieneAdicionalSNIS = true;
                $scope.valorAdicionalSNIS = 1.5;
            }
            if(empleado.seguroSalud == 16){
                $scope.tieneAdicionalSNIS = true;
                $scope.valorAdicionalSNIS = 5;
            }
            if(empleado.seguroSalud == 17){
                $scope.tieneAdicionalSNIS = true;
                $scope.valorAdicionalSNIS = 3.5;
            }
            buscarLiquidacion();
            //updateHaberes();
        }

        function buscarLiquidacion(){
            $scope.fueEditado = false;
            var dateLiquidacion = new Date($scope.anio, $scope.mes - 1);
            var ingresoEmpleado = new Date($scope.empleadoSeleccionado.fechaIngreso);
            ingresoEmpleado.setDate(1);
            $scope.mensaje = "";
            $scope.mensajeErrorLiquidaciones = "";
            $scope.errorLiquidacion = false;
            $scope.fechaLiquidacion = "";
            $scope.liquidacionEncontrada = false;
            console.log("parámetros: " +  $scope.empresa + $scope.nombre + $scope.mes + $scope.anio + $scope.empleadoSeleccionado._id);
            if(dateLiquidacion < ingresoEmpleado){
                $scope.errorLiquidacion = true;
                $scope.mensajeErrorLiquidaciones = "Error: Fecha anterior a ingreso del empleado"
            }
            console.log("undefined o null?: " + $scope.empleadoSeleccionado.fechaEgreso);
            if($scope.empleadoSeleccionado.fechaEgreso != null){
                var dateEgreso = new Date($scope.empleadoSeleccionado.fechaEgreso);
                $scope.errorLiquidacion = true;
                $scope.mensajeErrorLiquidaciones = "Error: empleado dado de baja el "  + dateEgreso.getDate() + "/" + (dateEgreso.getMonth()+1) + "/" + dateEgreso.getFullYear();
            }
            else{
                $http.get("/liquidaciones/buscar/" + $scope.empresa + "/" + $scope.nombre + "/" + $scope.mes + "/" + $scope.anio + "/" + $scope.empleadoSeleccionado._id).then(respuestaOk, respuestaError);

                function respuestaOk(respuesta){
                    console.log("Entró en Ok: " + JSON.stringify(respuesta, null, 4));
                    if(respuesta.data.nombreLiquidacion == "Sueldo"){
                        if(respuesta.data.info != null){
                            console.log("TIENE DATOS!");
                            $scope.liquidacion.id = respuesta.data.info._id;
                            $scope.liquidacion.sueldo = respuesta.data.info.sueldo;
                            $scope.fechaLiquidacion = respuesta.data.info.fechaLiquidacion;
                            $scope.montoIrpf = respuesta.data.info.irpf;
                            $scope.liquidacionEncontrada = true;
                            if(respuesta.data.info.cantidadFaltas != null){
                                console.log("Entró a faltas");
                                $scope.liquidacion.tieneFaltas = true;
                                $scope.liquidacion.faltas = respuesta.data.info.cantidadFaltas;
                                $scope.empleadoSeleccionado.descuentoFaltas = respuesta.data.info.descuentoFaltas;
                            }
                            else{
                                $scope.liquidacion.tieneFaltas = false;
                            }
                            if(respuesta.data.info.cantidadHorasExtra != null){
                                $scope.liquidacion.tieneHorasExtra = true;
                                $scope.liquidacion.horasExtra = respuesta.data.info.cantidadHorasExtra;
                                $scope.empleadoSeleccionado.montoHorasExtra = respuesta.data.info.montoHorasExtra;
                            }
                            else{
                                $scope.liquidacion.tieneHorasExtra = false;
                            }
                        }
                    }
                    if(respuesta.data.nombreLiquidacion == "Aguinaldo"){
                        console.log("Entró en Aguinaldo");
                        if(respuesta.data.exito){
                            if(respuesta.data.info != null){
                                $scope.liquidacion.id = respuesta.data.info._id;
                                console.log("Econtró aguinaldo liquidado: " + respuesta.data.info);
                                $scope.fechaLiquidacion = respuesta.data.info.fechaLiquidacion;
                                $scope.liquidacionEncontrada = true;
                                $scope.liquidacion.sueldo = 0;
                                $scope.liquidacion.tieneFaltas = false;
                                $scope.liquidacion.faltas = 0;
                                $scope.liquidacion.tieneHorasExtra = false;
                                $scope.liquidacion.horasExtra = 0;
                            }
                        }
                        else{
                            console.log("Mensaje error aguinaldo: " + respuesta.data.info);
                            $scope.aguinaldos = {};
                            $scope.haberes = "";
                            $scope.haberesGravados = "";
                            $scope.descuentoAporteJubilatorio = "";
                            $scope.descuentoFRL = "";
                            $scope.descuentoSeguroPorEnfermedad = "";
                            $scope.descuentoSNIS = "";
                            $scope.descuentos = "";
                            $scope.montoIrpf = "";
                            $scope.mensajeAguinaldo = respuesta.data.info;
                        }
                    }
                    if(respuesta.data.nombreLiquidacion == "Salario Vacacional"){
                        $scope.sv.mensaje = "";
                        $scope.sv.tieneMensaje = false;
                        if(respuesta.data.info != null){
                            $scope.liquidacion.id = respuesta.data.info._id;
                            $scope.fechaLiquidacion = respuesta.data.info.fechaLiquidacion;
                            $scope.liquidacionEncontrada = true;
                            $scope.sv.diasGozar = respuesta.data.info.diasGozarSV;
                            $scope.sv.montoSVdia = respuesta.data.info.montoDiaSV;
                            $scope.sv.monto = respuesta.data.info.totalHaberes;
                        }
                        else{
                            $scope.sv.diasGozar = "";
                            $scope.sv.montoSVdia = "";
                            $scope.sv.monto = "";
                        }
                    }
                    if(respuesta.data.nombreLiquidacion == "Egreso"){
                        $scope.egreso.yaExiste = false;
                        $scope.egreso.mensaje = "";
                        if(respuesta.data.info != ""){
                            console.log("Egreso: Entró a respuesta.data.info != ''")
                            respuesta.data.info.forEach(function(liquidacion){
                                $scope.liquidacion.id = respuesta.data.info._id;
                                var fechaActual = new Date($scope.anio, $scope.mes - 1); //porque va de 0 a 11
                                // var mesEgreso = liquidacion.fechaEgreso.getMonth() + 1; //porque va de 0 a 11
                                // var anioEgreso = liquidacion.fechaEgreso.getFullYear();
                                if(liquidacion.fechaEgreso > $scope.empleadoSeleccionado.fechaIngreso){
                                    // pregunto si hay alguna liquidacion posterior a la fecha de ingreso del empleado
                                    $scope.egreso.yaExiste = true;
                                    $scope.egreso.mensaje = "Error: ya se le dio de baja a este empleado"
                                }
                            });
                        }
                    }
                    updateHaberes();
                }

                function respuestaError(respuesta){
                    console.log("Error: " + respuesta.data.info);
                }
            }
        }

        $scope.haySelected = function(){
            if(typeof $scope.mes === "undefined" || $scope.mes == null){
                var fecha = new Date();
                $scope.mes = fecha.getMonth() + 1;
            }
            if(typeof $scope.anio === "undefined" || $scope.anio == null){
                var fecha = new Date();
                $scope.anio = fecha.getFullYear();
            }
            if($scope.selected){
                $scope.valorAporteJubilatorio = 15;
                $scope.valorFRL = 0.125;
                $scope.valorSeguroPorEnfermedad = 3;
                
                $scope.tieneAdicionalSNIS = false;
                $scope.valorAdicionalSNIS = 0;
                //$scope.empleadoSeleccionado = empleado;
                $scope.selected = true;
                //$scope.sueldo = empleado.sueldo;
                $scope.liquidacion = {};
                $scope.liquidacion.sueldo = $scope.empleadoSeleccionado.sueldo;
                $scope.liquidacion.esJornalero = $scope.empleadoSeleccionado.esJornalero;
                $scope.liquidacion.faltas = "";
                $scope.liquidacion.horasExtra ="";
                $scope.mensaje = "";
                $scope.fechaLiquidacion = "";
                
                $scope.empleadoSeleccionado.haberes = $scope.empleadoSeleccionado.sueldo;
                if($scope.empleadoSeleccionado.seguroSalud == 1){
                    $scope.tieneAdicionalSNIS = true;
                    $scope.valorAdicionalSNIS = 3;
                }
                if($scope.empleadoSeleccionado.seguroSalud == 15){
                    $scope.tieneAdicionalSNIS = true;
                    $scope.valorAdicionalSNIS = 1.5;
                }
                if($scope.empleadoSeleccionado.seguroSalud == 16){
                    $scope.tieneAdicionalSNIS = true;
                    $scope.valorAdicionalSNIS = 5;
                }
                if($scope.empleadoSeleccionado.seguroSalud == 17){
                    $scope.tieneAdicionalSNIS = true;
                    $scope.valorAdicionalSNIS = 3.5;
                }
                buscarLiquidacion();
            }
        }

        $scope.actualizarDatos = function(){
            updateHaberes();
        }

        $scope.calcularMontoJornales = function(){
            if(typeof $scope.liquidacion.jornales === "undefined" || $scope.liquidacion.jornales == null || !$scope.liquidacion.esJornalero){
                $scope.liquidacion.jornales = 0;
            }
            $http.post("/liquidaciones/calcularMontoJornales", $scope.liquidacion).then(respuestaOk, respuestaError);

            function respuestaOk(respuesta){
                $scope.liquidacion.sueldoJornalero = Math.round(respuesta.data * 100) / 100;
                $scope.fueEditado = true;
                updateHaberes();
            }
        }

        $scope.calcularFaltas = function(){
            if(typeof $scope.liquidacion.faltas === "undefined" || $scope.liquidacion.faltas == null || !$scope.liquidacion.tieneFaltas){
                $scope.liquidacion.faltas = 0;
            }
            //$scope.liquidacion.sueldo = $scope.sueldo;
            console.log("Faltas: " + $scope.liquidacion.faltas);
            $http.post("/liquidaciones/calcularFaltas", $scope.liquidacion).then(respuestaOk, respuestaError);

            function respuestaOk(respuesta){
                console.log(respuesta);
                $scope.empleadoSeleccionado.descuentoFaltas = Math.round(respuesta.data * 100) / 100; //para tener decimales
                //$scope.empleadoSeleccionado.haberes = $scope.sueldo - parseInt(respuesta.data);
                $scope.fueEditado = true;
                updateHaberes();
            }
            function respuestaError(respuesta){
                console.log("Error: " + respuesta.data);
            }
        }

        $scope.calcularHorasExtra = function(){
            if(typeof $scope.liquidacion.horasExtra === "undefined" || $scope.liquidacion.horasExtra == null || !$scope.liquidacion.tieneHorasExtra){
                $scope.liquidacion.horasExtra = 0;
            }
            //$scope.liquidacion.sueldo = $scope.sueldo;
            $scope.liquidacion.horasPorDia = $scope.empleadoSeleccionado.horasPorDia;
            $http.post("/liquidaciones/calcularHorasExtra", $scope.liquidacion).then(respuestaOk, respuestaError);

            function respuestaOk(respuesta){
                console.log(respuesta.data);
                $scope.empleadoSeleccionado.montoHorasExtra = Math.round(respuesta.data * 100) / 100;
                //$scope.empleadoSeleccionado.haberes = $scope.sueldo + parseInt(respuesta.data);
                $scope.fueEditado = true;
                updateHaberes();
            }
            function respuestaError(respuesta){
                console.log("Error: " + respuesta.data);
            }
        }

        $scope.calcularDescansoTrabajado = function(){
            if(typeof $scope.liquidacion.descansoTrabajado === "undefined" || $scope.liquidacion.descansoTrabajado == null || !$scope.liquidacion.tieneDescansoTrabajado){
                $scope.liquidacion.descansoTrabajado = 0;
            }
            $scope.liquidacion.horasPorDia = $scope.empleadoSeleccionado.horasPorDia;
            $http.post("/liquidaciones/calcularDescansoTrabajado", $scope.liquidacion).then(respuestaOk, respuestaError);

            function respuestaOk(respuesta){
                $scope.liquidacion.montoDescansoTrabajado = Math.round(respuesta.data * 100) / 100;
                $scope.fueEditado = true;
                updateHaberes();
            }
            function respuestaError(respuesta){
                console.log("Error: " + respuesta.data);
            }
        }

        $scope.calcularFeriadoTrabajado = function(){
            if(typeof $scope.liquidacion.feriadoPago === "undefined" || $scope.liquidacion.feriadoPago == null || !$scope.liquidacion.tieneFeriadoPago){
                $scope.liquidacion.feriadoPago = 0;
            }
            $http.post("/liquidaciones/calcularFeriadoTrabajado", $scope.liquidacion).then(respuestaOk, respuestaError);

            function respuestaOk(respuesta){
                $scope.liquidacion.montoFeriadoPago = Math.round(respuesta.data * 100) / 100;
                $scope.fueEditado = true;
                updateHaberes();
            }
            function respuestaError(respuesta){
                console.log("Error: " + respuesta.data);
            }
        }

        $scope.calcularDiasSV = function(){
            if(typeof $scope.sv.diasGozar === "undefined" || $scope.sv.diasGozar == null || !$scope.esSalarioVacacional){
                $scope.sv.diasGozar = 0;
            }
            console.log("El Scope de días a Gozar: " + $scope.sv.diasGozar);
            $scope.sv.sueldo = $scope.empleadoSeleccionado.sueldo;
            $scope.sv.empleadoId = $scope.empleadoSeleccionado._id;
            $scope.sv.mesLiquidacion = $scope.mes;
            $scope.sv.anioLiquidacion = $scope.anio;
            $scope.sv.empresa = $scope.empresa;
            $scope.sv.porcentajeDeducciones = $scope.valorAporteJubilatorio + $scope.valorFRL + $scope.valorSeguroPorEnfermedad + $scope.valorAdicionalSNIS;

            $http.post("/liquidaciones/calcularSalarioVacacional", $scope.sv).then(respuestaOk, respuestaError);

            function respuestaOk(respuesta){
                if(respuesta.data.exito){
                    $scope.sv.monto = Math.round(respuesta.data.montoSVliquido * 100) / 100;
                    $scope.sv.montoSVdia = Math.round(respuesta.data.montoSVdia * 100) / 100;
                    console.log("Monto SV: " + $scope.sv.monto)
                }
                else{
                    $scope.sv.mensaje = respuesta.data.mensaje;
                    $scope.sv.tieneMensaje = true;
                }
                $scope.fueEditado = true;
                updateHaberes();
            }
            function respuestaError(respuesta){
                console.log("Error: " + respuesta.data);
            }
        }

        $scope.calcularEgreso = function(){
            if(typeof $scope.egreso.fechaEgreso === "undefined" || $scope.egreso.fechaEgreso == null || !$scope.esEgreso){
                $scope.egreso.fechaEgreso = new Date(); //pongo una fecha para poder hacer el calculo
            }
            $scope.egreso.fechaIngreso = $scope.empleadoSeleccionado.fechaIngreso;
            $scope.egreso.sueldo = $scope.empleadoSeleccionado.sueldo;
            $scope.egreso.empleadoId = $scope.empleadoSeleccionado._id;
            $scope.egreso.mesLiquidacion = $scope.mes;
            $scope.egreso.anioLiquidacion = $scope.anio;
            $scope.egreso.empresa = $scope.empresa;
            $scope.egreso.porcentajeDeducciones = $scope.valorAporteJubilatorio + $scope.valorFRL + $scope.valorSeguroPorEnfermedad + $scope.valorAdicionalSNIS;
            var dateFechaEgreso = new Date($scope.egreso.fechaEgreso);
            var dateFechaIngreso = new Date($scope.egreso.fechaIngreso);

            if(dateFechaEgreso > dateFechaIngreso){
                //necesito los días a gozar también del año anterior. Ej: si egresa el 15 de enero seguramente tenga los 20 días sin gozar del año anterior (en empleado)
                $http.get("/empleados/diasLicencia/" + $scope.empleadoSeleccionado.fechaIngreso + "/" + $scope.mes + "/" + $scope.anio).then(respuestaOk, respuestaError);

                function respuestaOk(respuesta){
                    $scope.egreso.diasLicenciaAnioAnterior = respuesta.data; //cantidad total de días año anterior

                    $http.get("/liquidaciones/calcularDiasGozadosSV/" + $scope.empresa + "/" + $scope.empleadoSeleccionado._id + "/" + $scope.mes + "/" + $scope.anio).then(okRespuesta, errorRespuesta);

                    function okRespuesta(resp){
                        $scope.egreso.diasGozadosAnioAnterior = resp.data; //días gozados año anterior. Por diferencia saco si tiene alguno sin gozar

                        $http.post("/liquidaciones/calcularEgreso", $scope.egreso).then(respOk, respError);

                        function respOk(res){
                            if(res.data.exito){
                                console.log("días licencia no gozados: " + res.data.diasLicenciaNoGozados);
                                $scope.egreso.licenciaNoGozada = Math.round(res.data.diasLicenciaNoGozados * res.data.montoBaseNominal / 30 * 100) / 100;
                                $scope.egreso.salarioVacacional = Math.round(res.data.diasLicenciaNoGozados * res.data.montoBaseNominal / 30 * 100) / 100;
                                $scope.egreso.aguinaldo = Math.round(res.data.aguinaldo * 100) / 100;
                                $scope.egreso.ipd = Math.round(res.data.montoIPD * 100) / 100;
                                $scope.egreso.alicuotaAguinaldo = Math.round(res.data.alicuotaAguinaldo * 100) / 100;
                                $scope.egreso.alicuotaLicencia = Math.round(res.data.alicuotaLicencia * 100) / 100;
                                $scope.egreso.alicuotaSV = Math.round(res.data.alicuotaSV * 100) / 100;
                            }
                            $scope.fueEditado = true;
                            updateHaberes();
                        }
                        function respError(res){
                            console.log("Error: " + res.data);
                        }
                    }
                    function errorRespuesta(resp){
                        console.log("Error: " + resp.data);
                    }
                }
                function respuestaError(respuesta){
                    console.log("Error: " + respuesta.data);
                }
            }
            else{
                $scope.egreso.diasLicenciaAnioAnterior = 0;
                $scope.egreso.diasGozadosAnioAnterior = 0;
            }
        }

        function updateHaberes(){
            console.log("Entró a updateHaberes");
            $scope.empleadoSeleccionado.haberes = 0;
            if(typeof $scope.empleadoSeleccionado.descuentoFaltas === "undefined" || $scope.empleadoSeleccionado.descuentoFaltas == null || !$scope.liquidacion.tieneFaltas){
                $scope.empleadoSeleccionado.descuentoFaltas = 0;
            }
            if(typeof $scope.empleadoSeleccionado.montoHorasExtra === "undefined" || $scope.empleadoSeleccionado.montoHorasExtra == null || !$scope.liquidacion.tieneHorasExtra){
                $scope.empleadoSeleccionado.montoHorasExtra = 0;
            }
            if(typeof $scope.liquidacion.fictoPropina === "undefined" || $scope.liquidacion.fictoPropina == null || !$scope.liquidacion.tieneFictoPropina){
                $scope.liquidacion.fictoPropina = 0;
            }
            if(typeof $scope.liquidacion.montoDescansoTrabajado === "undefined" || $scope.liquidacion.montoDescansoTrabajado == null || !$scope.liquidacion.tieneDescansoTrabajado){
                $scope.liquidacion.montoDescansoTrabajado = 0;
            }
            if(typeof $scope.liquidacion.montoFeriadoPago === "undefined" || $scope.liquidacion.montoFeriadoPago == null || !$scope.liquidacion.tieneFeriadoPago){
                $scope.liquidacion.montoFeriadoPago = 0;
            }
            if(typeof $scope.liquidacion.primaPorAntiguedad === "undefined" || $scope.liquidacion.primaPorAntiguedad == null || !$scope.liquidacion.tienePrimaPorAntiguedad){
                $scope.liquidacion.primaPorAntiguedad = 0;
            }
            if(typeof $scope.liquidacion.primaPorProductividad === "undefined" || $scope.liquidacion.primaPorProductividad == null || !$scope.liquidacion.tienePrimaPorProductividad){
                $scope.liquidacion.primaPorProductividad = 0;
            }
            if(typeof $scope.liquidacion.adelanto === "undefined" || $scope.liquidacion.adelanto == null || !$scope.liquidacion.tieneAdelanto){
                $scope.liquidacion.adelanto = 0;
            }
            if(typeof $scope.liquidacion.retencion === "undefined" || $scope.liquidacion.retencion == null || !$scope.liquidacion.tieneRetencion){
                $scope.liquidacion.retencion = 0;
            }
            console.log($scope.empleadoSeleccionado.montoHorasExtra);
            console.log($scope.empleadoSeleccionado.descuentoFaltas);
            var sueldoJornalero = $scope.liquidacion.sueldoJornalero;
            var sueldo = $scope.liquidacion.sueldo;
            var montoHorasExtra = $scope.empleadoSeleccionado.montoHorasExtra;
            var descuentoFaltas = $scope.empleadoSeleccionado.descuentoFaltas;
            var fictoPropina = $scope.liquidacion.fictoPropina;
            var montoDescansoTrabajado = $scope.liquidacion.montoDescansoTrabajado;
            var montoFeriadoPago = $scope.liquidacion.montoFeriadoPago;
            var primaPorAntiguedad = $scope.liquidacion.primaPorAntiguedad;
            var primaPorProductividad = $scope.liquidacion.primaPorProductividad;
            if($scope.empleadoSeleccionado.esJornalero){
                $scope.empleadoSeleccionado.haberes = $scope.liquidacion.sueldoJornalero + $scope.empleadoSeleccionado.montoHorasExtra - $scope.empleadoSeleccionado.descuentoFaltas;
            }
            if($scope.esSueldo){
                console.log(sueldo + " - " + montoHorasExtra + " - " + fictoPropina + " - " + montoDescansoTrabajado + " - " + montoFeriadoPago + " - " + primaPorAntiguedad + " - " + primaPorProductividad + " - " - descuentoFaltas);
                $scope.empleadoSeleccionado.haberes = sueldo + montoHorasExtra + fictoPropina + montoDescansoTrabajado + montoFeriadoPago + primaPorAntiguedad + primaPorProductividad - descuentoFaltas;
                $scope.empleadoSeleccionado.haberes = Math.round($scope.empleadoSeleccionado.haberes * 100) / 100;

                $scope.haberes = $scope.empleadoSeleccionado.haberes;
                $scope.haberesGravados = sueldo + montoHorasExtra + fictoPropina + montoDescansoTrabajado + montoFeriadoPago + primaPorAntiguedad + primaPorProductividad - descuentoFaltas;
                $scope.haberesGravados = Math.round($scope.haberesGravados * 100) / 100;
                $scope.descuentoAporteJubilatorio = Math.round($scope.haberesGravados * 0.15 * 100) / 100; //para tener decimales
                $scope.descuentoFRL = Math.round($scope.haberesGravados * 0.00125 * 100) / 100;
                $scope.descuentoSeguroPorEnfermedad = Math.round($scope.haberesGravados * 0.03 * 100) / 100;
                $scope.descuentoSNIS = Math.round($scope.haberesGravados * ($scope.valorAdicionalSNIS / 100) * 100) / 100;
                $scope.descuentos = Math.round(($scope.descuentoAporteJubilatorio + $scope.descuentoFRL + $scope.descuentoSeguroPorEnfermedad + $scope.descuentoSNIS + $scope.liquidacion.adelanto + $scope.liquidacion.retencion) * 100) / 100;
                $scope.liquidoCobrar = $scope.haberes - $scope.descuentos;

                if($scope.empleadoSeleccionado.hijosMenores == null){
                    $scope.empleadoSeleccionado.hijosMenores = 0;
                }
                $scope.irpf = {};
                $scope.irpf.haberesIrpf = $scope.haberes;
                $scope.irpf.haberesIrpfVacacional = 0;
                $scope.irpf.descuentosIrpf = Math.round(($scope.descuentoAporteJubilatorio + $scope.descuentoFRL + $scope.descuentoSeguroPorEnfermedad + $scope.descuentoSNIS) * 100) / 100;;
                $scope.irpf.hijosMenores = $scope.empleadoSeleccionado.hijosMenores;
                $scope.irpf.empresa = $scope.empresa;
                $scope.irpf.mes = $scope.mes;
                $scope.irpf.anio = $scope.anio;
                $scope.irpf.empleadoId = $scope.empleadoSeleccionado._id;
                $scope.irpf.nombreLiquidacion = $scope.nombre;
    
                if(!$scope.liquidacionEncontrada || ($scope.liquidacionEncontrada && $scope.fueEditado)){
                    //Si no fue encontrada o si fue econtrada y editada, entra
                    $http.post("/liquidaciones/calcularIrpf", $scope.irpf).then(respuestaOk, respuestaError);
    
                    function respuestaOk(respuesta){
                        if(respuesta.data != null){
                            $scope.montoIrpf = parseInt(respuesta.data);
                            $scope.liquidoCobrar = $scope.liquidoCobrar - $scope.montoIrpf;
                        }
                    }
                    function respuestaError(respuesta){
                        console.log("Error: " + respuesta.data);
                    }
                }
                else{
                    if($scope.montoIrpf != ""){
                        $scope.liquidoCobrar = $scope.liquidoCobrar - $scope.montoIrpf;
                    }
                }
            }
            if($scope.esAguinaldo){
                $scope.montoIrpf = "";
                if($scope.mes == 6 || $scope.mes == 12){
                    $http.get("liquidaciones/calcularAguinaldo/" + $scope.empresa + "/" + $scope.nombre + "/" + $scope.mes + "/" + $scope.anio + "/" + $scope.empleadoSeleccionado._id).then(respuestaOk, respuestaError);

                    function respuestaOk(respuesta){
                        if(respuesta.data.exito){
                            if(respuesta.data.info != null){
                                $scope.mensajeAguinaldo = "";
                                $scope.aguinaldos = respuesta.data.info;
                                $scope.aguinaldos.forEach(function(aguinaldo) {
                                    $scope.empleadoSeleccionado.haberes = $scope.empleadoSeleccionado.haberes + aguinaldo.totalHaberes;
                                });
                                $scope.empleadoSeleccionado.haberes = $scope.empleadoSeleccionado.haberes / 12;
                                $scope.empleadoSeleccionado.haberes = Math.round($scope.empleadoSeleccionado.haberes * 100) / 100;

                                $scope.haberes = $scope.empleadoSeleccionado.haberes;
                                $scope.haberesGravados = $scope.empleadoSeleccionado.haberes;
                                $scope.descuentoAporteJubilatorio = Math.round($scope.haberesGravados * 0.15 * 100) / 100; //para tener decimales
                                $scope.descuentoFRL = Math.round($scope.haberesGravados * 0.00125 * 100) / 100;
                                $scope.descuentoSeguroPorEnfermedad = Math.round($scope.haberesGravados * 0.03 * 100) / 100;
                                $scope.descuentoSNIS = Math.round($scope.haberesGravados * ($scope.valorAdicionalSNIS / 100) * 100) / 100;
                                $scope.descuentos = Math.round(($scope.descuentoAporteJubilatorio + $scope.descuentoFRL + $scope.descuentoSeguroPorEnfermedad + $scope.descuentoSNIS) * 100) / 100;
                                $scope.liquidoCobrar = $scope.haberes - $scope.descuentos;
                            }
                        }
                    }
                    function respuestaError(respuesta){
                        console.log("Error: " + respuesta.data.info);
                    }
                }
            }
            console.log("Es SV? " + $scope.esSalarioVacacional);
            if($scope.esSalarioVacacional){
                console.log("entró en SV");
                $http.get("/empleados/diasLicencia/" + $scope.empleadoSeleccionado.fechaIngreso + "/" + $scope.mes + "/" + $scope.anio).then(respuestaOk, respuestaError);

                function respuestaOk(respuesta){
                    $scope.sv.diasLicencia = respuesta.data;
                    $scope.haberes = $scope.sv.monto;
                    $scope.haberesGravados = 0;
                    $scope.descuentoAporteJubilatorio = 0
                    $scope.descuentoFRL = 0
                    $scope.descuentoSeguroPorEnfermedad = 0
                    $scope.descuentoSNIS = 0
                    $scope.descuentos = 0
                    $scope.liquidoCobrar = $scope.haberes - $scope.descuentos;
                    console.log("montoSV: " + $scope.haberes);

                    $http.get("/liquidaciones/calcularDiasGozadosSV/" + $scope.empresa + "/" + $scope.empleadoSeleccionado._id + "/" + $scope.mes + "/" + $scope.anio).then(okRespuesta, errorRespuesta);

                    function okRespuesta(resp){
                        $scope.sv.diasGozados = resp.data;

                        if($scope.empleadoSeleccionado.hijosMenores == null){
                            $scope.empleadoSeleccionado.hijosMenores = 0;
                        }
                        $scope.irpf = {};
                        $scope.irpf.haberesIrpf = 0;
                        $scope.irpf.haberesIrpfVacacional = $scope.sv.monto;
                        $scope.irpf.descuentosIrpf = $scope.descuentos;
                        $scope.irpf.hijosMenores = $scope.empleadoSeleccionado.hijosMenores;
                        $scope.irpf.empresa = $scope.empresa;
                        $scope.irpf.mes = $scope.mes;
                        $scope.irpf.anio = $scope.anio;
                        $scope.irpf.empleadoId = $scope.empleadoSeleccionado._id;
                        $scope.irpf.nombreLiquidacion = $scope.nombre;
            
                        $http.post("/liquidaciones/calcularIrpf", $scope.irpf).then(rOk, rError);
            
                        function rOk(re){
                            if(re.data != null){
                                $scope.montoIrpf = parseInt(re.data);
                                $scope.liquidoCobrar = $scope.liquidoCobrar - $scope.montoIrpf;
                            }
                        }
                        function rError(re){
                            console.log("Error: " + re.data);
                        }
                    }
                    function errorRespuesta(resp){
                        console.log("Error: " + resp.data);
                    }
                }
                function respuestaError(respuesta){
                    console.log("Error: " + respuesta.data);
                }
            }
            if($scope.esEgreso){
                $scope.haberes = $scope.egreso.licenciaNoGozada + $scope.egreso.salarioVacacional + $scope.egreso.aguinaldo;
                if($scope.egreso.tieneIPD){
                    $scope.haberes = $scope.haberes + $scope.egreso.ipd + $scope.egreso.alicuotaAguinaldo + $scope.egreso.alicuotaLicencia + $scope.egreso.alicuotaSV
                }
                $scope.haberes = Math.round($scope.haberes * 100) / 100;
                $scope.haberesGravados = $scope.egreso.aguinaldo;
                $scope.haberesGravados = Math.round($scope.haberesGravados * 100) / 100;

                $scope.descuentoAporteJubilatorio = Math.round($scope.haberesGravados * 0.15 * 100) / 100; //para tener decimales
                $scope.descuentoFRL = Math.round($scope.haberesGravados * 0.00125 * 100) / 100;
                $scope.descuentoSeguroPorEnfermedad = Math.round($scope.haberesGravados * 0.03 * 100) / 100;
                $scope.descuentoSNIS = Math.round($scope.haberesGravados * ($scope.valorAdicionalSNIS / 100) * 100) / 100;
                $scope.descuentos = Math.round(($scope.descuentoAporteJubilatorio + $scope.descuentoFRL + $scope.descuentoSeguroPorEnfermedad + $scope.descuentoSNIS + $scope.liquidacion.adelanto + $scope.liquidacion.retencion) * 100) / 100;
                $scope.liquidoCobrar = $scope.haberes - $scope.descuentos;

                if($scope.empleadoSeleccionado.hijosMenores == null){
                    $scope.empleadoSeleccionado.hijosMenores = 0;
                }
                $scope.irpf = {};
                $scope.irpf.haberesIrpf = $scope.egreso.licenciaNoGozada;
                $scope.irpf.haberesIrpfVacacional = $scope.egreso.salarioVacacional;
                $scope.irpf.descuentosIrpf = Math.round(($scope.descuentoAporteJubilatorio + $scope.descuentoFRL + $scope.descuentoSeguroPorEnfermedad + $scope.descuentoSNIS) * 100) / 100;
                $scope.irpf.hijosMenores = $scope.empleadoSeleccionado.hijosMenores;
                $scope.irpf.empresa = $scope.empresa;
                $scope.irpf.mes = $scope.mes;
                $scope.irpf.anio = $scope.anio;
                $scope.irpf.empleadoId = $scope.empleadoSeleccionado._id;
                $scope.irpf.nombreLiquidacion = $scope.nombre;
    
                $http.post("/liquidaciones/calcularIrpf", $scope.irpf).then(respuestaOk, respuestaError);
    
                function respuestaOk(respuesta){
                    if(respuesta.data != null){
                        $scope.montoIrpf = parseInt(respuesta.data);
                        $scope.liquidoCobrar = $scope.liquidoCobrar - $scope.montoIrpf;
                    }
                }
                function respuestaError(respuesta){
                    console.log("Error: " + respuesta.data);
                }
            }
        }

        $scope.updateFaltas = function(){
            $scope.liquidacion.faltas = "";
            updateHaberes();
        }
    
        $scope.updateHorasExtra = function(){
            $scope.liquidacion.horasExtra = "";
            updateHaberes();
        }

        $scope.updateFictoPropina = function(){
            $scope.liquidacion.fictoPropina = "";
            updateHaberes();
        }

        $scope.updateDescansoTrabajado = function(){
            $scope.liquidacion.descansoTrabajado = "";
            updateHaberes();
        }

        $scope.updateFeriadoPago = function (){
            $scope.liquidacion.feriadoPago = "";
            updateHaberes();
        }

        $scope.updatePrimaPorAntiguedad = function(){
            $scope.liquidacion.primaPorAntiguedad = "";
            updateHaberes();
        }

        $scope.updatePrimaPorProductividad = function(){
            $scope.liquidacion.primaPorProductividad = "";
            updateHaberes();
        }

        $scope.updateAdelanto = function(){
            $scope.liquidacion.adelanto = "";
            updateHaberes();
        }

        $scope.updateRetencion = function(){
            $scope.liquidacion.retencion = "";
            updateHaberes();
        }
        
        $scope.crearLiquidacion = function(){
            $scope.nuevaLiq = {};
            $scope.nuevaLiq.empresa = $scope.empresa;
            $scope.nuevaLiq.nombre = $scope.nombre;
            $scope.nuevaLiq.mes = $scope.mes;
            $scope.nuevaLiq.anio = $scope.anio;
            $scope.nuevaLiq.empleadoId = $scope.empleadoSeleccionado._id;
            $scope.nuevaLiq.empleadoCi = $scope.empleadoSeleccionado.ci;
            $scope.nuevaLiq.sueldo = $scope.liquidacion.sueldo;
            $scope.nuevaLiq.cantidadFaltas = $scope.liquidacion.faltas;
            $scope.nuevaLiq.descuentoFaltas = $scope.empleadoSeleccionado.descuentoFaltas;
            $scope.nuevaLiq.cantidadHorasExtra = $scope.liquidacion.horasExtra;
            $scope.nuevaLiq.montoHorasExtra = $scope.empleadoSeleccionado.montoHorasExtra;
            $scope.nuevaLiq.montoFictoPropina = $scope.liquidacion.fictoPropina;
            $scope.nuevaLiq.cantidadDescansoTrabajado = $scope.liquidacion.descansoTrabajado;
            $scope.nuevaLiq.montoDescansoTrabajado = $scope.liquidacion.montoDescansoTrabajado;
            $scope.nuevaLiq.cantidadFeriadoPago = $scope.liquidacion.feriadoPago;
            $scope.nuevaLiq.montoFeriadoPago = $scope.liquidacion.montoFeriadoPago;
            $scope.nuevaLiq.montoPrimaPorAntiguedad = $scope.liquidacion.primaPorAntiguedad; //cambiar si tiene fórmula a monto
            $scope.nuevaLiq.montoPrimaPorProductividad = $scope.liquidacion.primaPorProductividad
            $scope.nuevaLiq.totalHaberesGravados = $scope.haberesGravados;
            $scope.nuevaLiq.totalHaberes = $scope.haberes;
            $scope.nuevaLiq.montoAdelantos = $scope.liquidacion.adelanto;
            $scope.nuevaLiq.montoRetenciones = $scope.liquidacion.retencion;
            $scope.nuevaLiq.valorAporteJubilatorio = $scope.valorAporteJubilatorio;
            $scope.nuevaLiq.descuentoAporteJubilatorio = $scope.descuentoAporteJubilatorio;
            $scope.nuevaLiq.valorFRL = $scope.valorFRL;
            $scope.nuevaLiq.descuentoFRL = $scope.descuentoFRL;
            $scope.nuevaLiq.valorSeguroPorEnfermedad = $scope.valorSeguroPorEnfermedad;
            $scope.nuevaLiq.descuentoSeguroPorEnfermedad = $scope.descuentoSeguroPorEnfermedad;
            $scope.nuevaLiq.valorAdicionalSNIS = $scope.valorAdicionalSNIS;
            $scope.nuevaLiq.descuentoSNIS = $scope.descuentoSNIS;
            $scope.nuevaLiq.irpf = $scope.montoIrpf;
            $scope.nuevaLiq.totalDescuentos = $scope.descuentos;
            $scope.nuevaLiq.liquidoCobrar = $scope.liquidoCobrar;
            $scope.nuevaLiq.diasGozarSV = "";
            $scope.nuevaLiq.montoDiaSV = "";
            $scope.nuevaLiq.egresoAguinaldo = "";
            $scope.nuevaLiq.egresoLicenciaNoGozada = "";
            $scope.nuevaLiq.egresoSV = "";
            $scope.nuevaLiq.egresoIPD = "";
            $scope.nuevaLiq.egresoAlicuotaAguinaldo = "";
            $scope.nuevaLiq.egresoAlicuotaLicencia = "";
            $scope.nuevaLiq.egresoAlicuotaSV = "";
            if($scope.esSalarioVacacional){
                $scope.nuevaLiq.valorAporteJubilatorio = "";
                $scope.nuevaLiq.valorFRL = "";
                $scope.nuevaLiq.valorSeguroPorEnfermedad = "";
                $scope.nuevaLiq.valorAdicionalSNIS = "";
                $scope.nuevaLiq.diasGozarSV = $scope.sv.diasGozar;
                $scope.nuevaLiq.montoDiaSV = $scope.sv.montoSVdia;
            }
            if($scope.esEgreso){
                $scope.nuevaLiq.egresoAguinaldo = $scope.egreso.aguinaldo;
                $scope.nuevaLiq.egresoLicenciaNoGozada = $scope.egreso.licenciaNoGozada;
                $scope.nuevaLiq.egresoSV = $scope.egreso.salarioVacacional;
                $scope.nuevaLiq.egresoIPD = $scope.egreso.ipd;
                $scope.nuevaLiq.egresoAlicuotaAguinaldo = $scope.egreso.alicuotaAguinaldo;
                $scope.nuevaLiq.egresoAlicuotaLicencia = $scope.egreso.alicuotaLicencia;
                $scope.nuevaLiq.egresoAlicuotaSV = $scope.egreso.alicuotaSV;
                
                $scope.empleadoSeleccionado.fechaEgreso = $scope.egreso.fechaEgreso;
                $http.post("/empleados/darDeBaja", $scope.empleadoSeleccionado).then(respuestaOk, respuestaError);

                function respuestaOk(respuesta){
                    console.log("Mensaje: " + respuesta.data.mensaje);
                }
                function respuestaError(respuesta){
                    console.log("Error: " + respuesta.data)
                }
            }
    
            $http.post("/liquidaciones/guardarNueva", $scope.nuevaLiq).then(respuestaOk, respuestaError);
    
            function respuestaOk(respuesta){
                $scope.mensaje = respuesta.data.mensaje;
                if(respuesta.data.exito){
                    buscarLiquidacion();
                }
                else{
                    $scope.mensaje = respuesta.data.mensaje;
                }
            }
            function respuestaError(respuesta){
                console.log("Error: " + respuesta.data);
            }
        }

        $scope.editarLiquidacion = function(){
            if(typeof $scope.empleadoSeleccionado.descuentoFaltas === "undefined" || $scope.empleadoSeleccionado.descuentoFaltas == null || !$scope.liquidacion.tieneFaltas){
                $scope.empleadoSeleccionado.descuentoFaltas = 0;
                $scope.liquidacion.faltas = 0;
            }
            if(typeof $scope.empleadoSeleccionado.montoHorasExtra === "undefined" || $scope.empleadoSeleccionado.montoHorasExtra == null || !$scope.liquidacion.tieneHorasExtra){
                $scope.empleadoSeleccionado.montoHorasExtra = 0;
                $scope.liquidacion.horasExtra = 0;
            }
            if(typeof $scope.liquidacion.fictoPropina === "undefined" || $scope.liquidacion.fictoPropina == null || !$scope.liquidacion.tieneFictoPropina){
                $scope.liquidacion.fictoPropina = 0;
            }
            if(typeof $scope.liquidacion.montoDescansoTrabajado === "undefined" || $scope.liquidacion.montoDescansoTrabajado == null || !$scope.liquidacion.tieneDescansoTrabajado){
                $scope.liquidacion.montoDescansoTrabajado = 0;
                $scope.liquidacion.descansoTrabajado = 0;
            }
            if(typeof $scope.liquidacion.montoFeriadoPago === "undefined" || $scope.liquidacion.montoFeriadoPago == null || !$scope.liquidacion.tieneFeriadoPago){
                $scope.liquidacion.montoFeriadoPago = 0;
                $scope.liquidacion.feriadoPago = 0;
            }
            if(typeof $scope.liquidacion.primaPorAntiguedad === "undefined" || $scope.liquidacion.primaPorAntiguedad == null || !$scope.liquidacion.tienePrimaPorAntiguedad){
                $scope.liquidacion.primaPorAntiguedad = 0;
            }
            if(typeof $scope.liquidacion.primaPorProductividad === "undefined" || $scope.liquidacion.primaPorProductividad == null || !$scope.liquidacion.tienePrimaPorProductividad){
                $scope.liquidacion.primaPorProductividad = 0;
            }
            if(typeof $scope.liquidacion.adelanto === "undefined" || $scope.liquidacion.adelanto == null || !$scope.liquidacion.tieneAdelanto){
                $scope.liquidacion.adelanto = 0;
            }
            if(typeof $scope.liquidacion.retencion === "undefined" || $scope.liquidacion.retencion == null || !$scope.liquidacion.tieneRetencion){
                $scope.liquidacion.retencion = 0;
            }
            $scope.nuevaLiq = {};
            $scope.nuevaLiq.id = $scope.liquidacion.id;
            $scope.nuevaLiq.empresa = $scope.empresa;
            $scope.nuevaLiq.nombre = $scope.nombre;
            $scope.nuevaLiq.mes = $scope.mes;
            $scope.nuevaLiq.anio = $scope.anio;
            $scope.nuevaLiq.empleadoId = $scope.empleadoSeleccionado._id;
            $scope.nuevaLiq.empleadoCi = $scope.empleadoSeleccionado.ci;
            $scope.nuevaLiq.sueldo = $scope.liquidacion.sueldo;
            $scope.nuevaLiq.cantidadFaltas = $scope.liquidacion.faltas;
            $scope.nuevaLiq.descuentoFaltas = $scope.empleadoSeleccionado.descuentoFaltas;
            $scope.nuevaLiq.cantidadHorasExtra = $scope.liquidacion.horasExtra;
            $scope.nuevaLiq.montoHorasExtra = $scope.empleadoSeleccionado.montoHorasExtra;
            $scope.nuevaLiq.montoFictoPropina = $scope.liquidacion.fictoPropina;
            $scope.nuevaLiq.cantidadDescansoTrabajado = $scope.liquidacion.descansoTrabajado;
            $scope.nuevaLiq.montoDescansoTrabajado = $scope.liquidacion.montoDescansoTrabajado;
            $scope.nuevaLiq.cantidadFeriadoPago = $scope.liquidacion.feriadoPago;
            $scope.nuevaLiq.montoFeriadoPago = $scope.liquidacion.montoFeriadoPago;
            $scope.nuevaLiq.montoPrimaPorAntiguedad = $scope.liquidacion.primaPorAntiguedad; //cambiar si tiene fórmula a monto
            $scope.nuevaLiq.montoPrimaPorProductividad = $scope.liquidacion.primaPorProductividad
            $scope.nuevaLiq.totalHaberesGravados = $scope.haberesGravados;
            $scope.nuevaLiq.totalHaberes = $scope.haberes;
            $scope.nuevaLiq.montoAdelantos = $scope.liquidacion.adelanto;
            $scope.nuevaLiq.montoRetenciones = $scope.liquidacion.retencion;
            $scope.nuevaLiq.valorAporteJubilatorio = $scope.valorAporteJubilatorio;
            $scope.nuevaLiq.descuentoAporteJubilatorio = $scope.descuentoAporteJubilatorio;
            $scope.nuevaLiq.valorFRL = $scope.valorFRL;
            $scope.nuevaLiq.descuentoFRL = $scope.descuentoFRL;
            $scope.nuevaLiq.valorSeguroPorEnfermedad = $scope.valorSeguroPorEnfermedad;
            $scope.nuevaLiq.descuentoSeguroPorEnfermedad = $scope.descuentoSeguroPorEnfermedad;
            $scope.nuevaLiq.valorAdicionalSNIS = $scope.valorAdicionalSNIS;
            $scope.nuevaLiq.descuentoSNIS = $scope.descuentoSNIS;
            $scope.nuevaLiq.irpf = $scope.montoIrpf;
            $scope.nuevaLiq.totalDescuentos = $scope.descuentos;
            $scope.nuevaLiq.liquidoCobrar = $scope.liquidoCobrar;
            $scope.nuevaLiq.diasGozarSV = "";
            $scope.nuevaLiq.montoDiaSV = "";
            $scope.nuevaLiq.egresoAguinaldo = "";
            $scope.nuevaLiq.egresoLicenciaNoGozada = "";
            $scope.nuevaLiq.egresoSV = "";
            $scope.nuevaLiq.egresoIPD = "";
            $scope.nuevaLiq.egresoAlicuotaAguinaldo = "";
            $scope.nuevaLiq.egresoAlicuotaLicencia = "";
            $scope.nuevaLiq.egresoAlicuotaSV = "";
            if($scope.esSalarioVacacional){
                $scope.nuevaLiq.valorAporteJubilatorio = "";
                $scope.nuevaLiq.valorFRL = "";
                $scope.nuevaLiq.valorSeguroPorEnfermedad = "";
                $scope.nuevaLiq.valorAdicionalSNIS = "";
                $scope.nuevaLiq.diasGozarSV = $scope.sv.diasGozar;
                $scope.nuevaLiq.montoDiaSV = $scope.sv.montoSVdia;
            }
            if($scope.esEgreso){
                $scope.nuevaLiq.egresoAguinaldo = $scope.egreso.aguinaldo;
                $scope.nuevaLiq.egresoLicenciaNoGozada = $scope.egreso.licenciaNoGozada;
                $scope.nuevaLiq.egresoSV = $scope.egreso.salarioVacacional;
                $scope.nuevaLiq.egresoIPD = $scope.egreso.ipd;
                $scope.nuevaLiq.egresoAlicuotaAguinaldo = $scope.egreso.alicuotaAguinaldo;
                $scope.nuevaLiq.egresoAlicuotaLicencia = $scope.egreso.alicuotaLicencia;
                $scope.nuevaLiq.egresoAlicuotaSV = $scope.egreso.alicuotaSV;
                
                $scope.empleadoSeleccionado.fechaEgreso = $scope.egreso.fechaEgreso;
                $http.post("/empleados/darDeBaja", $scope.empleadoSeleccionado).then(respuestaOk, respuestaError);

                function respuestaOk(respuesta){
                    console.log("Mensaje: " + respuesta.data.mensaje);
                }
                function respuestaError(respuesta){
                    console.log("Error: " + respuesta.data)
                }
            }
    
            $http.post("/liquidaciones/editarLiquidacion", $scope.nuevaLiq).then(respuestaOk, respuestaError);
    
            function respuestaOk(respuesta){
                $scope.mensaje = respuesta.data.mensaje;
                if(respuesta.data.exito){
                    buscarLiquidacion();
                }
                else{
                    $scope.mensaje = respuesta.data.mensaje;
                }
            }
            function respuestaError(respuesta){
                console.log("Error: " + respuesta.data);
            }
        }
    }
});

appEmpresa.controller("controladorEmpresaEmpleados", function($scope, $http, $location){
    $scope.empresa = "";
    $scope.empleados = {};
    if(!localStorage.estaLogeado){
        window.location.replace("login.html");
    }
    else{
        $scope.empresa = localStorage.empresaSeleccionada;
        //console.log($scope.empresa);
        $http.get("/empleados/" + $scope.empresa).then(respuestaOk, respuestaError);

        function respuestaOk(respuesta){
            console.log(respuesta);
            $scope.empleados = respuesta.data;
            //window.location.replace("empleados.html");
        }
        function respuestaError(respuesta){
            console.log("Error: " + respuesta.data);
        }

        $scope.empleadoEditar = function(empleado){
            localStorage.setItem("empleadoSeleccionado", empleado.ci);
            $location.path("/empleadoEditar");
        }
    }
});

appEmpresa.controller("controladorEmpleadoNuevo", function($scope, $http, $location){
    //$scope.empresa = {};
    if(!localStorage.estaLogeado){
        window.location.replace("login.html");
    }
    else{
        $scope.crearEmpleado = function(){
            $scope.empleadoNuevo.empresa = localStorage.empresaSeleccionada;
            $http.post("empleados/nuevo", $scope.empleadoNuevo).then(respuestaOk, respuestaError);

            function respuestaOk(respuesta){
                $scope.mensaje = respuesta.data.mensaje;
                if(respuesta.data.exito){
                    //window.location.replace("liquidaciones.html");
                    $location.path("/liquidaciones");
                }
                else{
                    $scope.mensaje = respuesta.data.mensaje;
                }
            }
            function respuestaError(respuesta){
                console.log("Error: " + respuesta.data);
            }
        }
    }
});

appEmpresa.controller("controladorEmpleadoEditar", function($scope, $http, $location){
    if(!localStorage.estaLogeado){
        window.location.replace("login.html");
    }
    else{
        console.log($scope);
        $http.get("/empleados/buscar/" + localStorage.empleadoSeleccionado).then(respuestaOk, respuestaError);

        function respuestaOk(respuesta){
            console.log(respuesta.data);
            $scope.empleadoEditar = respuesta.data;
            $scope.empleadoEditar.ci = parseInt(respuesta.data.ci);
            $scope.empleadoEditar.fechaNacimiento = new Date(respuesta.data.fechaNacimiento);
            $scope.empleadoEditar.fechaIngreso = new Date(respuesta.data.fechaIngreso);
            $scope.empleadoEditar.horasPorDia = parseInt(respuesta.data.horasPorDia);
            $scope.empleadoEditar.hijosMenores = parseInt(respuesta.data.hijosMenores);
            localStorage.removeItem("empleadoSeleccionado");
        }
        function respuestaError(respuesta){
            console.log("Error: " + respuesta.data);
        }

        $scope.editarEmpleado = function(){
            $http.put("/empleados/editar/" + $scope.empleadoEditar._id, $scope.empleadoEditar).then(respuestaOk, respuestaError);

            function respuestaOk(respuesta){
                $scope.mensaje = respuesta.data.mensaje;
                if(respuesta.data.exito){
                    $location.path("/empleados");
                }
                else{
                    $scope.mensaje = respuesta.data.mensaje;
                }
            }
            function respuestaError(respuesta){
                console.log("Error: " + respuesta.data);
            }
        }
    }
});