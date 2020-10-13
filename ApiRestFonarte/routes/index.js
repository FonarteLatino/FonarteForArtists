const { urlencoded } = require('express');
const express = require('express');
const data = require('../modulos/extraccion_de_datos');
const app = express();

/*let isLogin = () => true;

let logger = (req, res, next) => {
    console.log('Peticion tipo: ', req.method);
    next();
}

let showIP = (req, res, next) => {
    console.log('IP: 127.0.0.1');
    next();
}

app.use((req, res, next) => {
    if (isLogin()) {
        next();
    } else {
        res.send('No esta logeado')
    }
},logger,showIP);

//app.use(logger);

app.get('/:', (req, res) => {
    console.log(req.params)
    let  = req.params.;
    res.send(` ${}`);
});

app.get('/:user', (req, res) => {
    let usuario = req.params.user;
    res.send(`Bienvenido ${usuario}`);
});*/

app.get('/artista/:artista',(req,res)=>{
    console.log(req.params)
    let artista = req.params.artista;
    res.send(`Regresa los upc correspondientes a ${artista}`);
});

app.get('/disco/:disco', (req, res) => {
    console.log(req.params)
    let disco = req.params.disco;
    res.send(`Regresa informacion del disco ${disco}`);
});

app.get('/disco/:disco/upc/:upc', (req, res) => {
    console.log(req.params)
    let disco = req.params.disco;
    let upc = req.params.upc;
    res.send(`regresa informacion del disco ${disco} y upc ${upc}`);
});

app.get('/upc/:upc', (req, res) => {
    console.log(req.params)
    let upc = req.params.upc;
    res.send(`regresa informacion del upc ${upc}`);
});

app.get('/track/:upc', (req, res) => {
    console.log(req.params)
    let upc = req.params.upc;
    res.send(`regresa informacion de los tracks correspondientes al upc ${upc}`);
});

app.get('/plataforma/fecha/:fecha/upc/', (req, res, next) => {
    console.log(req.params);
    console.log(req.query);
    let fecha = req.params.fecha;
    let upc = req.query.upc;
    res.send(`regresa las plataformas de la fecha ${fecha} para los discos ${upc}`);
});

app.get('/pais/fecha/:fecha/plataforma/:plataforma/isrc/:isrc', (req, res) => {
    console.log(req.params)
    let isrc = req.params.isrc;
    let fecha = req.params.fecha;
    let plataforma = req.params.plataforma;
    res.send(`regresa lista de paises para el track ${isrc} en la plataforma ${plataforma} en la fecha ${fecha}`);
});




app.get('/', (req, res, next) => {
    console.log(req.query);
    res.send(`Hola`);
});

app.post('/', (req, res) => {
    res.send('Hola Mundo')
});

app.put('/', (req, res) => {
    res.send('Hola Mundo')
});

app.delete('/', (req, res) => {
    res.send('Hola Mundo')
});

app.listen(3000, () => {
    console.log('Escuchando en puerto 3000');
});