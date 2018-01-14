var appLogin = angular.module("appLogin", []);

appLogin.controller("controladorLogin", function($scope, $http){
    localStorage.clear();
    $scope.loginUsuario = {};
    $scope.usuarioActivo = {};
    $scope.mensaje = "";

    $scope.login = function (){
        $http.post("/login", $scope.loginUsuario).then(respuestaOk, respuestaError);

        function respuestaOk(respuesta){
            $scope.loginUsuario = {};
            $scope.mensaje = respuesta.data.mensaje;
            console.log(respuesta.data);
            if(respuesta.data.exito){
                $scope.usuarioActivo = respuesta.data.usuario;
                localStorage.setItem("usuario", respuesta.data.usuario.nombre);
                localStorage.setItem("estaLogeado", true);
                window.location.replace("spa.html");
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
    .when("/empresas", {
        templateUrl : "empresas.html",
        controller : "controladorEmpresas"
    })
    .when("/empresaNueva", {
        templateUrl : "empresaNueva.html",
        controller : "controladorEmpresaNueva"
    })
    .when("/liquidaciones", {
        templateUrl : "liquidaciones.html",
        controller : "controladorEmpresaLiquidaciones"
    })
    .when("/empleados", {
        templateUrl : "empleados.html",
        controller : "controladorEmpresaEmpleados"
    })
    .when("/empleadoNuevo", {
        templateUrl : "empleadoNuevo.html",
        controller : "controladorEmpleadoNuevo"
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

appEmpresa.controller("controladorEmpresas", function($scope, $http, $location, $routeParams){
    if(!localStorage.estaLogeado){
        window.location.replace("login.html");
    }
    else{
        localStorage.removeItem("empresaSeleccionada");
        $scope.empresas = {};
        
        $http.get("/empresas").then(respuestaOk, respuestaError);
    
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
    $scope.mensaje = "";
    $scope.tApors = {};
    $scope.tConts = {};
    if(!localStorage.estaLogeado){
        window.location.replace("login.html");
    }
    else{
        $scope.crearEmpresa = function(){
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

        $http.get("/empresas/tipoAportacion").then(respuestaOk, respuestaError);

        function respuestaOk(respuesta){
            $scope.tApors = respuesta.data;
            console.log($scope.tApors);
            console.log("Largo: " +  Object.keys($scope.tApors).length);
        }
        function respuestaError(respuesta){
            console.log("Error: " + respuesta.data);
        }

        $scope.cargarTiposContribuyentes = function(){
            console.log($scope.empresaNueva.tipoAportacion);
            $http.get("/empresas/tipoAportacion/tipoContribuyente/" + $scope.empresaNueva.tipoAportacion).then(respuestaOk, respuestaError);
            console.log("ENTRÓ")

            function respuestaOk(respuesta){
                $scope.tConts = respuesta.data;
                console.log($scope.tConts);
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