var express = require("express");
var app = express();
var mongoose = require("mongoose");
var configDb = require("./config/database");
var inicio = require("./modelo/inicio");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");

mongoose.connect(configDb.uri, { useMongoClient: true}, function(err){
    if(err){
        console.log("No se pudo conectar a la BD: " + err);
    }
    else{
        console.log("La clave generada por crypto es: " + configDb.secret); //para ver la clave del secret generado por crypto
        console.log("Conectado a la BD: " + configDb.db);
    }
});
mongoose.Promise = global.Promise;

app.use(express.static(__dirname + "/vistas"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());
inicio(app);

var server = app.listen(process.env.PORT || 3000, function(){
    console.log("Conectado al puerto 3000");
});