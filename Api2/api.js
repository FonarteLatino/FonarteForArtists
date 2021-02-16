const dboperations = require('./dboperations');
var DB = require('./dboperations');
var Objet = require('./Objets');

var express = require('express');
var axios = require('axios');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
var router = express.Router();
const pool = require('./dbconexionmysql');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());
app.use('/api',router);
 
router.use((request,response,next)=>{
    console.log('middleware');
    next(); 
})

router.route('/artists/actualizar').get(async (request,response)=>{
    let respuesta;
    await axios({
        method: 'GET',
        url: 'http://localhost:8090/api/artistas'
    }).then(res=>{
        respuesta = res.data;    
    }).catch(err => console.log(err))
    
    //console.log(respuesta.length);
    
    let q = 'INSERT INTO `artista`(`nombre`) VALUES ';
    console.log(respuesta)
    let c = 0;
    respuesta.forEach(element => {
        c = c + 1;
        q = q + '(\''
        //console.log(element);
        let e = element.ARTIST.replace('\'', '\\\'')
        if (c < respuesta.length) {
            q = q + e + '\'),';
        } else {
            q = q + e + '\')';
        }
    });
    console.log(q);
    //console.log(c);
    var result = await pool.query(q);
    
    response.status(201).json(result);
    /*dboperations.addArtista(artist).then(result => {
        response.status(201).json(result);
    })*/ 
})

router.route('/discos/actualizar').get(async (request,response)=>{
    let respuesta;
    await axios({
        method: 'GET',
        url: 'http://localhost:8090/api/discos'
    }).then(res=>{
        respuesta = res.data;    
    }).catch(err => console.log(err))
    
    //console.log(respuesta.length);
    
    let q = 'INSERT INTO `disco`(`UPC`, `artista_id`, `nombre`) VALUES ';
    console.log(respuesta)
    let c = 0;
    respuesta.forEach(async element => {
        
        //c = c + 1;
        //q = q + '(\''
        //console.log(element);
        let e = element.ARTIST.replace('\'', '\\\'');
        var res = await pool.query('SELECT `id` FROM `artista` WHERE `nombre` = \''+e+'\'');
        console.log(res);
        //if (c < respuesta.length) {
          //  q = q + e + '\'),';
        //} else {
          //  q = q + e + '\')';
        //}
    });
    console.log(q);
    //console.log(c);
    //var result = await pool.query(q);
    
    //response.status(201).json(result);
    response.status(201);
    /*dboperations.addArtista(artist).then(result => {
        response.status(201).json(result);
    })*/ 
})


var port = process.env.PORT ||8091;
app.listen(port);
console.log('Order API is rinning at '+ port);
 
dboperations.artistas().then(result => {
    console.log(result); 
})