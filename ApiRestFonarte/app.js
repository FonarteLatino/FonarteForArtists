const dboperations = require('./modulos/dboperations');
const exOperations = require('./modulos/externalOperations');
const procesar = require('./modulos/procesamiento');

//var conection = require('./links');
var remplaced = require('replaceall');

var express = require('express');
const jwt = require("jsonwebtoken");
var axios = require('axios');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
var router = express.Router();

const { request } = require('https');
const { response } = require('express');
const crypto = require('bcryptjs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());
app.use('/api',router);

router.use((request,response,next)=>{
  console.log('middleware');
  next(); 
});

router.route('/').get(async (request,response)=>{
  response.json({
      mensaje: "Nodejs y JWT"
  });
});

router.route('/actualizar/artistas').get(async (request,response)=>{
  let res = await procesar.actualizarArtistas();
  //console.log(res);
  if (!res) {
    response.status(400).json("Problemas de conexion con las bases de datos");
  }else{
    response.status(201).json("Se actualizaron los artistas exitosamente");
  }
})

router.route('/actualizar/discos').get(async (request,response)=>{
  let res = await procesar.actualizarDiscos();
  if (!res) {
    response.status(400).json("Problemas de conexion con las bases de datos");
  }else{
    response.status(201).json("Se actualizaron los discos exitosamente");
  }
});

router.route('/actualizar/canciones').get(async (request,response)=>{
  let r = await procesar.actualizarCanciones();
  console.log(r);
  if (!r) {
    response.status(400).json("Existe un error de conexion");  
  }else{
    response.status(201).json("Se actualizaron las canciones exitosamente");
  }
});

router.route('/actualizar/regalias').get(async (request,response)=>{
  let r = await procesar.actualizarRegalias();
  console.log(r);
  if (!r) {
    response.status(400).json("Existe un error de conexion");  
  }else {
    response.status(201).json("Se actualizaron las regalias exitosamente");
  }
});

router.route('/altadiscos').post(async (request,response)=>{
  //console.log(request.body);
  let r = await procesar.asignarDiscos(request.body);
  if (!r) {
    response.status(400).json("Existe un error de conexion");  
  }
  response.status(201).json("Se dieron de alta los discos para el sello de manera exitosa");
});

var port = process.env.PORT ||8090;
app.listen(port);
console.log('Order API is rinning at '+ port);

