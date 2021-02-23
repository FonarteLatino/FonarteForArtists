const dboperations = require('./dboperations');
var DB = require('./dboperations');
var Objet = require('./Objets');
var remplaced = require('replaceall');

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

router.route('/artists/inicial').get(async (request,response)=>{
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
        let e = remplaced.replaceall('\'', '\\\'',element.ARTIST);
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
   
})

router.route('/discos/inicial').get(async (request,response)=>{
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
    let x = ' ';
    
    for (const element of respuesta) {
        
        c = c + 1;
            
        console.log(element);
        
        let e = remplaced.replaceall('\'', '\\\'',element.ARTIST);
        var res = await pool.query('SELECT `id` FROM `artista` WHERE `nombre` = \''+e+'\'');
        //console.log(res[0].id);
        let a =  remplaced.replaceall('\'', '\\\'',element.ALBUM_NAME);
        q = q + '(\'';
        if (c < respuesta.length) {
            q = q + element.UPC + '\',\'' + res[0].id + '\',\'' + a + '\'),';
            //console.log(q);
        } else {
            q = q + element.UPC + '\',\'' + res[0].id + '\',\'' + a + '\')';
            //console.log(q);
        }
        x = x + ',' + element.UPC;
    }
    //console.log(q);

    var result = await pool.query(q);
    
    response.status(201).json(result);
    
})

router.route('/canciones/inicial').get(async (request,response)=>{
    let respuesta;
    await axios({
        method: 'GET',
        url: 'http://localhost:8090/api/canciones'
    }).then(res=>{
        respuesta = res.data;    
    }).catch(err => console.log(err))
    
    //console.log(respuesta.length);
    
    let q = 'INSERT INTO `cancion`(`ISRC`, `disco_UPC`, `nombre`) VALUES ';
    console.log(respuesta)
    let c = 0;
    respuesta.forEach(element => {
        c = c + 1;
        q = q + '(\''
        console.log(c);
        console.log(element);
        //let e = element.TRACK_NAME.replace('\'', '\\\'');
        let e = remplaced.replaceall('\'', '\\\'',element.TRACK_NAME);
        if (c < respuesta.length) {
            q = q + element.ISRC + '\',\'' + element.UPC + '\',\'' + e + '\'),';
        } else {
            q = q + element.ISRC + '\',\'' + element.UPC + '\',\'' + e + '\')';
        }
    });
    console.log(q);
    //console.log(c);
    var result = await pool.query(q);
    
    response.status(201).json(result);
   
})


var port = process.env.PORT ||8091;
app.listen(port);
console.log('Order API is rinning at '+ port);
 
dboperations.artistas().then(result => {
    console.log(result); 
})