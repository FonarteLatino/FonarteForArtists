const { urlencoded } = require('express');
const express = require('express');
const data = require('../modulos/extraccion_de_datos');
const app = express();

const { Connection, Request } = require("tedious");

// Create connection to database
const config = {
  authentication: {
    options: {
      userName: "Dataguys2", // update me
      password: "Fonarte2018" // update me
    },
    type: "default"
  },
  server: "fonarte2.database.windows.net", // update me
  options: {
    database: "Reporteador", //update me
    encrypt: true
  }
};
//SELECT DISTINCT [Retailer] FROM [dbo].[000_Client_Dashboard_Total] where ([UPC] = '7509841275835' or [UPC] = '7509841277167') and [Year_Month] = '2020-8'
  //SELECT DISTINCT [Country_Sale] FROM [dbo].[000_Client_Dashboard_Total] where [ISRC] = 'MXF602000184' and [Year_Month] = '2020-8' and [Retailer]='Spotify'
  //SELECT SUM (Net_Royalty_Total) as RegaliasTotales FROM [dbo].[000_Client_Dashboard_Total] where [ISRC] = 'MXF602000184' and [Year_Month] = '2020-8' and [Retailer]='Spotify' and [Country_Sale] = 'Mexico'

var requ = (req)=>{
    const connection = new Connection(config);
    connection.on("connect", err => {
        if (err) {
        console.error(err.message);
        } else {
        queryDatabase(req);
        }
    }); 

    function queryDatabase(query) {
    console.log("Reading rows from the Table...");

    // Read all rows from table 
        
    const request = new Request(
        query,
        (err, rowCount) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log(`${rowCount} row(s) returned`);
        }
        }
    );

    request.on("row", columns => {
        columns.forEach(column => {
        console.log("%s\t%s", column.metadata.colName, column.value);
        });
    });

    connection.execSql(request);
    }
};

app.get('/artista/:artista',(req,res)=>{
    console.log(req.params)
    let artista = req.params.artista;
    
    let q = `SELECT DISTINCT [ARTIST],[UPC] FROM [dbo].[BBDD_FINAL_CANCIONES] WHERE [ARTIST] = \'${artista}\'`;
    console.log(q);
    requ(q);
    res.send(`Regresa los upc correspondientes a ${artista}`);
    //res.send(q);
});

app.get('/disco/:disco', (req, res) => {
    console.log(req.params)
    let disco = req.params.disco;
    let q = `SELECT DISTINCT [UPC],[ARTIST],[ALBUM_NAME],[ISRC],[TRACK_NAME] FROM [dbo].[BBDD_FINAL_CANCIONES] where [ALBUM_NAME] = \'${disco}\'`;
    console.log(q);
    requ(q);
    res.send(`Regresa informacion del disco ${disco}`);
});

app.get('/disco/:disco/upc/:upc', (req, res) => {
    console.log(req.params)
    let disco = req.params.disco;
    let upc = req.params.upc;
    let q = `SELECT DISTINCT [UPC],[ARTIST],[ALBUM_NAME],[ISRC],[TRACK_NAME] FROM [dbo].[BBDD_FINAL_CANCIONES] where [ALBUM_NAME] = \'${disco}\' or [UPC] = \'${upc}\'`;
    console.log(q);
    requ(q);
    res.send(`regresa informacion del disco ${disco} y upc ${upc}`);
});

app.get('/upc/:upc', (req, res) => {
    console.log(req.params)
    let upc = req.params.upc;
    let q = `SELECT DISTINCT [UPC],[ARTIST],[ALBUM_NAME],[ISRC],[TRACK_NAME] FROM [dbo].[BBDD_FINAL_CANCIONES] where [UPC] = \'${upc}\'`;
    console.log(q);
    requ(q);
    res.send(`regresa informacion del upc ${upc}`);
});

/*app.get('/track/:upc', (req, res) => {
    console.log(req.params)
    let upc = req.params.upc;
    res.send(`regresa informacion de los tracks correspondientes al upc ${upc}`);
});*/

app.get('/plataforma/fecha/:fecha/upc/', (req, res, next) => {
    console.log(req.params);
    console.log(req.query);
    let fecha = req.params.fecha;
    let upc = req.query.upc;
    upc.forEach(element => {
       let  
    });
    //let q = `SELECT DISTINCT [Retailer] FROM [dbo].[000_Client_Dashboard_Total] where ([UPC] = '7509841275835' or [UPC] = '7509841277167') and [Year_Month] = '2020-8'`;
    //console.log(q);
    //requ(q);
    res.send(`regresa las plataformas de la fecha ${fecha} para los discos ${upc}`);
});

app.get('/pais/fecha/:fecha/plataforma/:plataforma/isrc/:isrc', (req, res) => {
    console.log(req.params)
    let isrc = req.params.isrc;
    let fecha = req.params.fecha;
    let plataforma = req.params.plataforma;
    res.send(`regresa lista de paises para el track ${isrc} en la plataforma ${plataforma} en la fecha ${fecha}`);
});

app.get('/resumen/pais/:pais/fecha/:fecha/plataforma/:plataforma/isrc/:isrc', (req, res) => {
    console.log(req.params)
    let isrc = req.params.isrc;
    let fecha = req.params.fecha;
    let plataforma = req.params.plataforma;
    let pais = req.params.pais;
    res.send(`regresa suma de regalias, suma de clicks y promedio por click para el track ${isrc} en la plataforma ${plataforma} en la fecha ${fecha} y en el pais ${pais}`);
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