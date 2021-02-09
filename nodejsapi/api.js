const dboperations = require('./dboperations');
var DB = require('./dboperations');
var Order = require('./order');

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
var router = express.Router();

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());
app.use('/api',router);

router.use((request,response,next)=>{
    console.log('middleware');
    next(); 
})
 
router.route('/artistas').get((request,response)=>{

    dboperations.artistas().then(result => {
        //console.log(result);
        response.json(result[0]);
    })
})

router.route('/artista/:artists').get((request,response)=>{

    dboperations.artista(request.params.artists).then(result => {
        //console.log(result);
        response.json(result[0]);
    })
})

router.route('/disco/:disco').get((request,response)=>{

    dboperations.disco(request.params.disco).then(result => {
        //console.log(result);
        response.json(result[0]);
    })
})

router.route('/disco/:disco/upc/:upc').get((request,response)=>{

    dboperations.discoUpc(request.params.disco,request.params.upc).then(result => {
        //console.log(result);
        response.json(result[0]);
    })
})

router.route('/upc/:upc').get((request,response)=>{

    dboperations.upc(request.params.upc).then(result => {
        //console.log(result);
        response.json(result[0]);
    })
})

router.route('/plataforma/fecha/:fecha/upc/').get((request,response)=>{
    console.log(request.params);
    console.log(request.query);
    dboperations.plataformaFecha(request.query.upc,request.params.fecha).then(result => {
        //console.log(result);
        response.json(result[0]);
    })
})

router.route('/pais/fecha/:fecha/plataforma/:plataforma/isrc/:isrc').get((request,response)=>{

    dboperations.paisFecha(request.params.isrc,request.params.fecha,request.params.plataforma).then(result => {
        //console.log(result);
        response.json(result[0]);
    })
})

router.route('/resumen/pais/:pais/fecha/:fecha/plataforma/:plataforma/isrc/:isrc').get((request,response)=>{

    dboperations.resumen(request.params.isrc,request.params.fecha,request.params.plataforma,request.params.pais).then(result => {
        //console.log(result);
        response.json(result[0]);
    })
})


var port = process.env.PORT ||8090;
app.listen(port);
console.log('Order API is rinning at '+ port);
 
dboperations.artistas().then(result => {
    console.log(result);
})