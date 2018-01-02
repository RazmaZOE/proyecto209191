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
                window.location.replace("empresas.html");
            }
        }
        function respuestaError(respuesta){
            console.log("Error: " + respuesta.data);
        }
    }
});

var appEmpresa = angular.module("appEmpresa", []);

appEmpresa.controller("controladorEmpresas", function($scope, $http){
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
                window.location.replace("liquidaciones.html");
            }
            function respuestaError(respuesta){
                console.log("Error: " + respuesta.data);
            }
        }
    }
});

appEmpresa.controller("controladorEmpresaNueva", function($scope, $http){
    $scope.mensaje = "";
    if(!localStorage.estaLogeado){
        window.location.replace("login.html");
    }
    else{
        $scope.crearEmpresa = function(){
            $http.post("/empresas/nueva", $scope.empresaNueva).then(respuestaOk, respuestaError);
            
            function respuestaOk(respuesta){
                $scope.mensaje = respuesta.data.mensaje;
                if(respuesta.data.exito){
                    window.location.replace("empresas.html");
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

appEmpresa.controller("controladorEmpresaLiquidaciones", function($scope, $http){
    $scope.empresa = "";
    if(!localStorage.estaLogeado){
        window.location.replace("login.html");
    }
    else{
        $scope.empresa = localStorage.empresaSeleccionada;
    }
});

appEmpresa.controller("controladorEmpresaEmpleados", function($scope, $http){
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

appEmpresa.controller("controladorEmpleadoNuevo", function($scope, $http){
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
                    window.location.replace("liquidaciones.html");
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