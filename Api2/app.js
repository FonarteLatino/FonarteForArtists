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

router.route('/artists/actualizar').get(async (request,response)=>{
    let respuesta;
    await axios({
        method: 'GET',
        url: 'http://localhost:8090/api/artistas'
    }).then(res=>{
        respuesta = res.data;    
    }).catch(err => console.log(err))
    
    //console.log(respuesta.length);
    console.log(respuesta);
    let a = 'SELECT * FROM `artista`'

    var result = await pool.query(a);
    console.log(result);

    console.log(respuesta.length);
    console.log(result.length);
    let aux = [];
    
    
    if (respuesta.length>result.length) {
        
        result.forEach(el =>{
            aux.push(el.nombre);
        });
        console.log(aux[0]);
        let c = 0;
        let q = 'INSERT INTO `artista`(`nombre`) VALUES ';
        console.log(aux.indexOf('CRISTIAN CASTRO & CARLOS MACÍAS'));
        console.log(aux.indexOf('SONALLI'));
        q = q + '(\'';
        let ins = '';
        respuesta.forEach(ele => {
            
            
            //aux.push(ele.ARTIST);
            let i = aux.indexOf(ele.ARTIST);
            //console.log(i);
            if (i == -1) {
                c = c + 1;
                console.log(ele.ARTIST);
                
                let e = remplaced.replaceall('\'', '\\\'',ele.ARTIST);
                if (c < (respuesta.length-result.length)) {
                    ins = ins + ele.ARTIST + ' , ';
                    q = q + e + '\'),(\'';
                } else {
                    ins = ins + ele.ARTIST;
                    q = q + e + '\')';
                }
            }

        });
        console.log(q);
        //var res = await pool.query(q);
        response.status(201).json(ins);
    }else if (respuesta.length<result.length) {
        
        respuesta.forEach(el =>{
            aux.push(el.ARTIST);
        });
        
        
        let c = 0;
        let q = 'DELETE FROM `artista` WHERE `nombre` = ';
        console.log(aux.indexOf('CRISTIAN CASTRO & CARLOS MACÍAS'));
        console.log(aux.indexOf('SONALLI'));
        q = q + '\'';
        let ins = '';
        result.forEach(ele => {
            
            
            //aux.push(ele.ARTIST);
            let i = aux.indexOf(ele.nombre);
            //console.log(i);
            if (i == -1) {
                c = c + 1;
                console.log(ele.nombre);
                
                let e = remplaced.replaceall('\'', '\\\'',ele.nombre);
                if (c <= (respuesta.length-result.length)) {
                    ins = ins + ele.nombre + ' , ';
                    q = q + e + '\' or `nombre` = \'';
                } else {
                    ins = ins + ele.nombre;
                    q = q + e + '\'';
                }
            }

        });
        console.log(q);
        //var res = await pool.query(q);
        
        response.status(201).json(ins);
    } else{
        response.status(201).json('No hay artistas nuevos');
    }

})

router.route('/sello/:usr').get(async (request,response)=>{
    console.log(request.params.usr);
    let q = 'SELECT * FROM `sello` WHERE `usr` = \'' + request.params.usr + '\'';
    
    console.log(q);
    
    var result = await pool.query(q);
    console.log(result);

    if (result == []) {
        console.log("esta vacio");
    }
    
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
router.route('/discos/actualizar').get(async (request,response)=>{
    let respuesta;
    await axios({
        method: 'GET',
        url: 'http://localhost:8090/api/discos'
    }).then(res=>{
        respuesta = res.data;    
    }).catch(err => console.log(err))
    
    console.log(respuesta);
    let a = 'SELECT * FROM `disco`'

    var result = await pool.query(a);
    console.log(result);

    console.log(respuesta.length);
    console.log(result.length);
    let aux = [];
    
    
    if (respuesta.length>result.length) {
        
        result.forEach(el =>{
            aux.push(el.nombre);
        });
        console.log(aux[0]);
        let c = 0;
        let q = 'INSERT INTO `disco`(`UPC`, `artista_id`, `nombre`) VALUES ';
        //console.log(aux.indexOf('CRISTIAN CASTRO & CARLOS MACÍAS'));
        //console.log(aux.indexOf('SONALLI'));
        q = q + '(\'';
        let ins = '';
        for (const ele of respuesta) {
            
            
            //aux.push(ele.ARTIST);
            let i = aux.indexOf(ele.ALBUM_NAME);
            //console.log(i);
            if (i == -1) {
                c = c + 1;
                console.log(ele.ALBUM_NAME);
                
                let e = remplaced.replaceall('\'', '\\\'',ele.ALBUM_NAME);
                if (c < (respuesta.length-result.length)) {
                    ins = ins + ele.ALBUM_NAME + ' , ';
                    q = q + e + '\'),(\'';
                } else {
                    ins = ins + ele.ALBUM_NAME;
                    q = q + e + '\')';
                }
            }

        };
        console.log(q);}/*
        //var res = await pool.query(q);
        response.status(201).json(ins);
    }else if (respuesta.length<result.length) {
        
        respuesta.forEach(el =>{
            aux.push(el.ARTIST);
        });
        
        
        let c = 0;
        let q = 'DELETE FROM `artista` WHERE `nombre` = ';
        console.log(aux.indexOf('CRISTIAN CASTRO & CARLOS MACÍAS'));
        console.log(aux.indexOf('SONALLI'));
        q = q + '\'';
        let ins = '';
        result.forEach(ele => {
            
            
            //aux.push(ele.ARTIST);
            let i = aux.indexOf(ele.nombre);
            //console.log(i);
            if (i == -1) {
                c = c + 1;
                console.log(ele.nombre);
                
                let e = remplaced.replaceall('\'', '\\\'',ele.nombre);
                if (c <= (respuesta.length-result.length)) {
                    ins = ins + ele.nombre + ' , ';
                    q = q + e + '\' or `nombre` = \'';
                } else {
                    ins = ins + ele.nombre;
                    q = q + e + '\'';
                }
            }

        });
        console.log(q);
        //var res = await pool.query(q);
        
        response.status(201).json(ins);
    } else{
        response.status(201).json('No hay artistas nuevos');
    }*/

    response.status(201).json('No hay artistas nuevos');

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

router.route('/regalias/actualizar').get(async (request,response)=>{
    let q = 'SELECT * FROM `sello`';
    var q1 = 'SELECT `s`.`usr`,`a`.`nombre`,`d`.`UPC`,`d`.`nombre` FROM `sello` AS `s` JOIN `artista` AS `a` ON `s`.`id` = `a`.`sello_id` JOIN `disco` AS `d` ON `d`.`artista_id` = `a`.`id` WHERE `s`.`usr` = BINARY \'';
    let q2 = 'SELECT `s`.`usr`,`a`.`nombre`,`d`.`UPC`,`d`.`nombre`,`c`.`ISRC`,`c`.`nombre` FROM `sello` AS `s` JOIN `artista` AS `a` ON `s`.`id` = `a`.`sello_id` JOIN `disco` AS `d` ON `d`.`artista_id` = `a`.`id` JOIN `cancion` AS `c` ON `d`.`UPC` = `c`.`disco_UPC` WHERE `s`.`usr` = BINARY \'';
    let q3 = 'SELECT DISTINCT `r`.`anio`,`r`.`mes` FROM `sello` AS `s` JOIN `artista` AS `a` ON `s`.`id` = `a`.`sello_id` JOIN `disco` AS `d` ON `d`.`artista_id` = `a`.`id` JOIN `cancion` AS `c` ON `d`.`UPC` = `c`.`disco_UPC` JOIN `regalias` AS `r` ON `c`.`ISRC` = `r`.`cancion_id` WHERE `s`.`usr` = BINARY \'';
    let ax = 'INSERT INTO `regalias`(`cancion_id`, `plataforma`, `anio`, `mes`, `clics`, `ingresos`, `pais`) VALUES (\'';
    var resta = 1000 * 60 * 60 * 24;
    var calculo = 0;
    var now= new Date();
    var respuesta;
    var respuesta1;
    var respuesta2;
    var result = await pool.query(q);
    //console.log(result);
    for (const e of result)
    {
        //console.log(q3+e.usr+'\'');
        
        var result1 = await pool.query(q3+e.usr+'\'');
        console.log(result1);
        if(/*result1.length>0*/result1.length<0)
        {
            console.log('si tiene registros')
        }else{
            let result1 = await pool.query(q1+e.usr+'\'');
            let UPC = '';
            console.log(result1);
            let c = 0;
            result1.forEach(element => {
                c = c + 1;
                console.log(element.UPC);
                if (c < result1.length) {
                    UPC = UPC + 'upc=' + element.UPC + '&';
                } else {
                    UPC = UPC + 'upc=' + element.UPC;
                }
            });
            console.log(UPC);
        
            let result2 = await pool.query(q2+e.usr+'\' ORDER BY `c`.`ISRC` ASC');
            let ISRC = [];
            console.log(result2);
            let c1 = 0;
            console.log('-----------------------------------------');
            result2.forEach(element1 => {
                c1 = c1 + 1;
                console.log(element1);
                ISRC.push(element1.ISRC);
            });
            console.log(ISRC);
            for (let index = 0; index < 12; index++) {
                calculo = now.getTime() - (resta * (29*(2 + index)));
                console.log(new Date(calculo).getMonth());
                let fecha = new Date(calculo);
                
                await axios({
                    method: 'GET',
                    url: 'http://localhost:8090/api/plataforma/fecha/'+fecha.getFullYear()+'-'+(fecha.getMonth()+1)+'/upc/?'+UPC
                }).then(res=>{
                    respuesta = res.data;    
                }).catch(err => console.log(err))
                
                console.log(respuesta);

                for (const elem of respuesta) {
                    console.log(fecha);
                    console.log(elem.Retailer);
                    for (const eleme of ISRC) {
                        console.log(eleme);
                        await axios({
                            method: 'GET',
                            url: 'http://localhost:8090/api/pais/fecha/'+fecha.getFullYear()+'-'+(fecha.getMonth()+1)+'/plataforma/'+'Spotify'/*elem.Retailer*/+'/isrc/'+eleme
                        }).then(res=>{
                            respuesta1 = res.data;    
                        }).catch(err => console.log(err))
                        
                        console.log(respuesta1);

                        if (respuesta1.length>0) {
                            for (const elemn of respuesta1) {
                                console.log(elemn.Country_Sale);
                                await axios({
                                    method: 'GET',
                                    url: 'http://localhost:8090/api/resumen/pais/'+elemn.Country_Sale+'/fecha/'+fecha.getFullYear()+'-'+(fecha.getMonth()+1)+'/plataforma/'+'Spotify'/*elem.Retailer*/+'/isrc/'+eleme
                                }).then(res=>{
                                    respuesta2 = res.data;    
                                }).catch(err => console.log(err))
                                console.log(respuesta2);
                                for (const e of respuesta2) {
                                    console.log(ax+eleme+'\',\''+'Spotify'/*elem.Retailer*/+'\','+fecha.getFullYear()+','+(fecha.getMonth()+1)+','+e.TotaldeClics+','+e.RegaliasTotales+',\''+elemn.Country_Sale+'\')');
                                    let result3 = await pool.query(ax+eleme+'\',\''+'Spotify'/*elem.Retailer*/+'\','+fecha.getFullYear()+','+(fecha.getMonth()+1)+','+e.TotaldeClics+','+e.RegaliasTotales+',\''+elemn.Country_Sale+'\')');
                                    console.log(result3);
                                }
                            }
                        }
                    }

                }
                
            }
        }
    }
    /*
    console.log(now);
    console.log(now.getMonth());
    console.log(now.getFullYear());
    let resta = 1000 * 60 * 60 * 24 * (29*2);
    let calculo = now.getTime() - resta;
    console.log(new Date(calculo));*/

    
    //let respuesta;
    /*await axios({
        method: 'GET',
        url: 'http://localhost:8090/api/plataforma/fecha/:fecha/upc/'
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
    */
    response.status(201).json("si");
   
})

router.route('/regalias/:usr').get(async (request,response)=>{
    console.log(request.params.usr);
    let q = 'SELECT `a`.`nombre` AS `nombreArtista`, `d`.`UPC`,`d`.`nombre` AS `nombreDisco`,`c`.`ISRC`,`c`.`nombre` AS `nombreCancion`,`re`.`plataforma`,`re`.`clics`,`re`.`ingresos`,`re`.`anio`,`re`.`mes`,`re`.`pais` FROM `sello` AS `s` JOIN `artista` AS `a` ON `s`.`id` = `a`.`sello_id` JOIN `disco` AS `d` ON `d`.`artista_id` = `a`.`id` JOIN `cancion` AS `c` ON `d`.`UPC` = `c`.`disco_UPC` JOIN `regalias` AS `re` ON `re`.`cancion_id` = `c`.`ISRC` WHERE `s`.`usr` = BINARY \'';
    q = q + request.params.usr + '\'';
    console.log(q);
    
    var result = await pool.query(q);
    console.log(result);

    if (result == []) {
        console.log("esta vacio");
    }
    
    response.status(201).json(result);
   
})


var port = process.env.PORT ||8091;
app.listen(port);
console.log('Order API is rinning at '+ port);
 
dboperations.artistas().then(result => {
    console.log(result); 
})