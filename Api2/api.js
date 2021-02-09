const dboperations = require('./dboperations');
var DB = require('./dboperations');
var Objet = require('./Objets');

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

router.route('/artist').post((request,response)=>{
    let artist = {...request.body}
    dboperations.addArtista(artist).then(result => {
        response.status(201).json(result);
    })
})


var port = process.env.PORT ||8091;
app.listen(port);
console.log('Order API is rinning at '+ port);
 
dboperations.artistas().then(result => {
    console.log(result);
})