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

//app.use(logger);*/

app.get('/:user', (req, res) => {
    let usuario = req.params.user;
    res.send(`Bienvenido ${usuario}`);
});

app.get('/',(req,res)=>{
    data.plataformas('mkj123456','2018-2');
    res.send(`Bienvenido`);
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